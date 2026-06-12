import axios from 'axios';
import { ArraySchema } from '@colyseus/schema';
import {
  DOOR,
  isServerRenderedObject,
  legacyHeadingToHeading,
  TILE_SIZE
} from '@bao/core';

import {
  MapNpcEntityState,
  MapObjectEntityState
} from '@/schema/MapEntityState';
import { MapState } from '@/schema/MapState';
import { MapSpawnService } from '@/services/MapSpawnService';
import { TileCoord } from '@/services/MapRegistry';
import { WorldRoom } from '@/rooms/WorldRoom';
import { config } from '@/config';

interface DoorVariantConfig {
  openObjectId: number;
  closedObjectId: number;
  openGraphicId: number;
  closedGraphicId: number;
  blockedTiles: TileCoord[];
}

interface ObjectAttributeRow {
  name: string;
  value: string;
}

interface ObjectWithAttributes {
  id: number;
  graphicId: number;
  attributes?: ObjectAttributeRow[];
}

export class MapEntitySystem {
  private readonly room: WorldRoom;
  private readonly mapSpawnService = new MapSpawnService();
  private readonly loadedMaps = new Set<number>();
  private readonly doorConfigs = new Map<string, DoorVariantConfig>();
  private readonly objectGraphicById = new Map<number, number>();

  constructor(room: WorldRoom) {
    this.room = room;
  }

  clearMap(mapId: number) {
    this.loadedMaps.delete(mapId);

    for (const key of [...this.doorConfigs.keys()]) {
      if (key.startsWith(`object:${mapId}:`)) {
        this.doorConfigs.delete(key);
      }
    }
  }

  private async fetchObjects(
    objectIds: number[]
  ): Promise<ObjectWithAttributes[]> {
    if (!objectIds.length || !process.env.ADMIN_API_KEY) {
      return [];
    }

    const response = await axios.get(`${config.apiBaseUrl}/admin/objects`, {
      headers: { 'x-admin-key': process.env.ADMIN_API_KEY },
      params: { ids: objectIds.join(',') }
    });

    return response.data ?? [];
  }

  private cacheObjectGraphics(objects: ObjectWithAttributes[]) {
    for (const object of objects) {
      this.objectGraphicById.set(object.id, object.graphicId);
    }
  }

  private getAttributeValue(
    object: ObjectWithAttributes,
    name: string
  ): number | null {
    const attribute = object.attributes?.find((entry) => entry.name === name);
    if (!attribute?.value) {
      return null;
    }

    const parsed = Number.parseInt(attribute.value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private async buildDoorConfigs(
    mapId: number,
    spawns: Array<{
      id: string;
      objectId: number;
      objectType: number;
      x: number;
      y: number;
      openObjectId?: number;
      closedObjectId?: number;
      openGraphicId?: number;
      closedGraphicId?: number;
    }>
  ) {
    const doorSpawns = spawns.filter((spawn) => spawn.objectType === DOOR);
    if (!doorSpawns.length) {
      return;
    }

    const unresolvedDoorObjectIds = new Set<number>();

    for (const spawn of doorSpawns) {
      if (spawn.openGraphicId && spawn.closedGraphicId) {
        const openObjectId = spawn.openObjectId ?? spawn.objectId;
        const closedObjectId = spawn.closedObjectId ?? spawn.objectId;
        this.objectGraphicById.set(openObjectId, spawn.openGraphicId);
        this.objectGraphicById.set(closedObjectId, spawn.closedGraphicId);
        this.doorConfigs.set(spawn.id, {
          openObjectId,
          closedObjectId,
          openGraphicId: spawn.openGraphicId,
          closedGraphicId: spawn.closedGraphicId,
          blockedTiles: this.room.mapRegistry.findDoorBlockedTiles(
            mapId,
            spawn.x,
            spawn.y
          )
        });
        continue;
      }

      unresolvedDoorObjectIds.add(spawn.objectId);
    }

    if (!unresolvedDoorObjectIds.size) {
      return;
    }

    const doorObjectIds = [...unresolvedDoorObjectIds];
    const doorObjects = await this.fetchObjects(doorObjectIds);
    this.cacheObjectGraphics(doorObjects);

    const relatedIds = new Set<number>();
    for (const object of doorObjects) {
      const openId = this.getAttributeValue(object, 'indexabierta');
      const closedId = this.getAttributeValue(object, 'indexcerrada');
      if (openId) {
        relatedIds.add(openId);
      }
      if (closedId) {
        relatedIds.add(closedId);
      }
    }

    const missingIds = [...relatedIds].filter(
      (id) => !this.objectGraphicById.has(id)
    );
    if (missingIds.length) {
      const relatedObjects = await this.fetchObjects(missingIds);
      this.cacheObjectGraphics(relatedObjects);
    }

    for (const spawn of doorSpawns) {
      if (this.doorConfigs.has(spawn.id)) {
        continue;
      }

      const object = doorObjects.find((entry) => entry.id === spawn.objectId);
      if (!object) {
        continue;
      }

      const openObjectId =
        this.getAttributeValue(object, 'indexabierta') ?? spawn.objectId;
      const closedObjectId =
        this.getAttributeValue(object, 'indexcerrada') ?? spawn.objectId;
      const openGraphicId = this.objectGraphicById.get(openObjectId);
      const closedGraphicId = this.objectGraphicById.get(closedObjectId);

      if (!openGraphicId || !closedGraphicId) {
        continue;
      }

      this.doorConfigs.set(spawn.id, {
        openObjectId,
        closedObjectId,
        openGraphicId,
        closedGraphicId,
        blockedTiles: this.room.mapRegistry.findDoorBlockedTiles(
          mapId,
          spawn.x,
          spawn.y
        )
      });
    }
  }

  private registerNpcBlocking(
    mapId: number,
    x: number,
    y: number,
    hostile: boolean
  ) {
    if (!hostile) {
      return;
    }

    this.room.mapRegistry.setRuntimeBlockedTiles(mapId, [{ x, y }], true);
  }

  private registerDoorBlocking(
    mapId: number,
    entityId: string,
    isOpen: boolean
  ) {
    const doorConfig = this.doorConfigs.get(entityId);
    if (!doorConfig?.blockedTiles.length) {
      return;
    }

    this.room.mapRegistry.setDoorTilesOpen(
      mapId,
      doorConfig.blockedTiles,
      isOpen
    );
    this.room.mapRegistry.setRuntimeBlockedTiles(
      mapId,
      doorConfig.blockedTiles,
      !isOpen
    );
  }

  async hydrateMap(mapId: number, authToken?: string) {
    const existing = this.room.state.maps.get(String(mapId));
    if (existing) {
      return existing;
    }

    if (this.loadedMaps.has(mapId)) {
      this.loadedMaps.delete(mapId);
    }

    const spawns = await this.mapSpawnService.fetchSpawns(mapId, authToken);
    const mapState = new MapState();
    mapState.mapId = mapId;
    mapState.name = spawns.map?.name ?? `Map ${mapId}`;

    mapState.npcs = new ArraySchema<MapNpcEntityState>(
      ...spawns.npcs.map((spawn, index) => {
        const entity = new MapNpcEntityState();
        entity.id = `npc:${mapId}:${index}`;
        entity.npcId = spawn.npcId;
        entity.bodyId = spawn.bodyId;
        entity.headId = spawn.headId;
        entity.heading = legacyHeadingToHeading(spawn.heading ?? 3);
        entity.description = spawn.description ?? '';
        entity.hostile = Boolean(spawn.hostile);
        entity.x = spawn.x;
        entity.y = spawn.y;
        this.registerNpcBlocking(mapId, spawn.x, spawn.y, entity.hostile);
        return entity;
      })
    );

    const objectEntities = spawns.objects
      .filter((spawn) => isServerRenderedObject(spawn.objectType))
      .map((spawn, index) => {
        const entity = new MapObjectEntityState();
        entity.id = `object:${mapId}:${index}`;
        entity.objectId = spawn.objectId;
        entity.graphicId = spawn.graphicId;
        entity.amount = spawn.amount;
        entity.objectType = spawn.objectType;
        entity.x = spawn.x;
        entity.y = spawn.y;
        return { entity, spawn };
      });

    await this.buildDoorConfigs(
      mapId,
      objectEntities.map(({ entity, spawn }) => ({
        id: entity.id,
        objectId: entity.objectId,
        objectType: entity.objectType,
        x: entity.x,
        y: entity.y,
        openObjectId: spawn.openObjectId,
        closedObjectId: spawn.closedObjectId,
        openGraphicId: spawn.openGraphicId,
        closedGraphicId: spawn.closedGraphicId
      }))
    );

    for (const { entity } of objectEntities) {
      const doorConfig = this.doorConfigs.get(entity.id);
      if (doorConfig) {
        entity.isOpen = entity.objectId === doorConfig.openObjectId;
        this.registerDoorBlocking(mapId, entity.id, entity.isOpen);
      }
    }

    mapState.objects = new ArraySchema<MapObjectEntityState>(
      ...objectEntities.map(({ entity }) => entity)
    );

    this.room.state.maps.set(String(mapId), mapState);
    this.loadedMaps.add(mapId);
    return mapState;
  }

  interactObject(sessionId: string, mapId: number, entityId: string): boolean {
    const character = this.room.state.characters.find(
      (entry) => entry.sessionId === sessionId
    );
    if (!character || character.mapId !== mapId) {
      return false;
    }

    const mapState = this.room.state.maps.get(String(mapId));
    const entity = mapState?.objects?.find((entry) => entry.id === entityId);
    if (!entity || entity.objectType !== DOOR) {
      return false;
    }

    const charTileX = Math.floor(character.x / TILE_SIZE);
    const charTileY = Math.floor(character.y / TILE_SIZE);
    const dx = Math.abs(charTileX - entity.x);
    const dy = Math.abs(charTileY - entity.y);
    if (dx > 1 || dy > 1 || (dx === 0 && dy === 0)) {
      return false;
    }

    const doorConfig = this.doorConfigs.get(entityId);
    if (!doorConfig) {
      return false;
    }

    if (entity.isOpen) {
      entity.objectId = doorConfig.closedObjectId;
      entity.graphicId = doorConfig.closedGraphicId;
      entity.isOpen = false;
      this.registerDoorBlocking(mapId, entityId, false);
    } else {
      entity.objectId = doorConfig.openObjectId;
      entity.graphicId = doorConfig.openGraphicId;
      entity.isOpen = true;
      this.registerDoorBlocking(mapId, entityId, true);
    }

    return true;
  }
}
