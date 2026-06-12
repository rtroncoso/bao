import {
  BorderNeighbor,
  computeBorderNeighbors,
  computeGridNeighbors,
  headingToBorderDirection,
  isMapEdgeForExitDirection,
  resolveGridTransitionLanding
} from '@bao/core/loaders/maps/world';
import { Heading } from '@bao/core/constants/game/Game';

import { MapSpawnService } from '@/services/MapSpawnService';
import { WorldsLoader } from '@/services/WorldsLoader';
import { WorldRoom } from '@/rooms/WorldRoom';
import { isMapVisibleToCharacter } from '@/util/mapInterest';

export interface TileExitRecord {
  targetMapId: number;
  targetX: number;
  targetY: number;
}

export interface TileCoord {
  x: number;
  y: number;
}

export class MapRegistry {
  private readonly mapSpawnService = new MapSpawnService();
  private readonly worldsLoader = new WorldsLoader();
  private readonly loadedMaps = new Set<number>();
  private readonly mapRefCounts = new Map<number, number>();
  private readonly tileExitsByMap = new Map<
    number,
    Map<string, TileExitRecord>
  >();
  private readonly borderNeighborsByMap = new Map<number, BorderNeighbor[]>();
  private readonly blockedTilesByMap = new Map<number, Set<string>>();
  private readonly unblockedTilesByMap = new Map<number, Set<string>>();
  private readonly runtimeBlockedTilesByMap = new Map<number, Set<string>>();

  constructor(private readonly room: WorldRoom) {}

  private tileKey(x: number, y: number) {
    return `${x}:${y}`;
  }

  async ensureMap(mapId: number, authToken?: string) {
    if (this.loadedMaps.has(mapId)) {
      return;
    }

    const spawns = await this.mapSpawnService.fetchSpawns(mapId, authToken);
    const exitIndex = new Map<string, TileExitRecord>();

    for (const exit of spawns.tileExits) {
      exitIndex.set(this.tileKey(exit.x, exit.y), {
        targetMapId: exit.targetMapId,
        targetX: exit.targetX,
        targetY: exit.targetY
      });
    }

    this.tileExitsByMap.set(mapId, exitIndex);
    this.borderNeighborsByMap.set(
      mapId,
      computeBorderNeighbors(spawns.tileExits)
    );
    this.blockedTilesByMap.set(
      mapId,
      new Set(
        (spawns.blockedTiles ?? []).map((tile) => this.tileKey(tile.x, tile.y))
      )
    );
    this.loadedMaps.add(mapId);
    await this.room.mapEntitySystem.hydrateMap(mapId, authToken);
  }

  async ensureMapsInInterest(
    mapId: number,
    localX: number,
    localY: number,
    authToken?: string
  ) {
    const mapIds = this.worldsLoader.getQuadrantMapIds(mapId, localX, localY);
    await Promise.all(mapIds.map((id) => this.ensureMap(id, authToken)));
  }

  registerCharacter(mapId: number) {
    this.mapRefCounts.set(mapId, (this.mapRefCounts.get(mapId) ?? 0) + 1);
  }

  unregisterCharacter(mapId: number) {
    const next = (this.mapRefCounts.get(mapId) ?? 1) - 1;
    if (next <= 0) {
      this.mapRefCounts.delete(mapId);
      return;
    }

    this.mapRefCounts.set(mapId, next);
  }

  getTileExit(mapId: number, x: number, y: number): TileExitRecord | null {
    return this.tileExitsByMap.get(mapId)?.get(this.tileKey(x, y)) ?? null;
  }

  /**
   * Grid fallback when no tile-exit record exists: only on the outermost map edge,
   * heading off-map, with a worlds.json neighbor in that direction.
   */
  resolveBorderTransition(
    mapId: number,
    x: number,
    y: number,
    heading: Heading
  ): TileExitRecord | null {
    const exitDirection = headingToBorderDirection(heading);
    if (!exitDirection) {
      return null;
    }

    if (!isMapEdgeForExitDirection(x, y, exitDirection)) {
      return null;
    }

    const worlds = this.worldsLoader.load();
    if (!worlds) {
      return null;
    }

    const targetMapId = computeGridNeighbors(mapId, worlds)[exitDirection];
    if (!targetMapId) {
      return null;
    }

    const landing = resolveGridTransitionLanding(exitDirection, x, y);
    return {
      targetMapId,
      targetX: landing.targetX,
      targetY: landing.targetY
    };
  }

  isTileStaticallyBlocked(mapId: number, x: number, y: number): boolean {
    const key = this.tileKey(x, y);

    if (this.unblockedTilesByMap.get(mapId)?.has(key)) {
      return false;
    }

    if (this.runtimeBlockedTilesByMap.get(mapId)?.has(key)) {
      return true;
    }

    return this.blockedTilesByMap.get(mapId)?.has(key) ?? false;
  }

  setRuntimeBlockedTiles(mapId: number, tiles: TileCoord[], blocked: boolean) {
    if (!tiles.length) {
      return;
    }

    const tileSet =
      this.runtimeBlockedTilesByMap.get(mapId) ?? new Set<string>();

    for (const tile of tiles) {
      const key = this.tileKey(tile.x, tile.y);
      if (blocked) {
        tileSet.add(key);
      } else {
        tileSet.delete(key);
      }
    }

    if (tileSet.size > 0) {
      this.runtimeBlockedTilesByMap.set(mapId, tileSet);
    } else {
      this.runtimeBlockedTilesByMap.delete(mapId);
    }
  }

  setDoorTilesOpen(mapId: number, tiles: TileCoord[], isOpen: boolean) {
    if (!tiles.length) {
      return;
    }

    const tileSet = this.unblockedTilesByMap.get(mapId) ?? new Set<string>();

    for (const tile of tiles) {
      const key = this.tileKey(tile.x, tile.y);
      if (isOpen) {
        tileSet.add(key);
      } else {
        tileSet.delete(key);
      }
    }

    if (tileSet.size > 0) {
      this.unblockedTilesByMap.set(mapId, tileSet);
    } else {
      this.unblockedTilesByMap.delete(mapId);
    }
  }

  findDoorBlockedTiles(mapId: number, x: number, y: number): TileCoord[] {
    const staticBlocks = this.blockedTilesByMap.get(mapId);
    const candidates: TileCoord[] = [
      { x, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
      { x: x + 1, y },
      { x: x - 1, y }
    ];

    if (staticBlocks) {
      const matched = candidates.filter((tile) =>
        staticBlocks.has(this.tileKey(tile.x, tile.y))
      );
      if (matched.length >= 2) {
        return matched.slice(0, 2);
      }
    }

    return [
      { x, y },
      { x, y: y + 1 }
    ];
  }

  isMapNeededByAnyCharacter(mapId: number): boolean {
    const worlds = this.worldsLoader.load();

    for (const character of this.room.state.characters) {
      if (
        isMapVisibleToCharacter(
          mapId,
          character.mapId,
          character.tile.x,
          character.tile.y,
          worlds
        )
      ) {
        return true;
      }
    }

    return false;
  }

  pruneMapsOutsideInterest() {
    for (const mapId of [...this.loadedMaps]) {
      if (this.isMapNeededByAnyCharacter(mapId)) {
        continue;
      }

      this.loadedMaps.delete(mapId);
      this.tileExitsByMap.delete(mapId);
      this.borderNeighborsByMap.delete(mapId);
      this.blockedTilesByMap.delete(mapId);
      this.unblockedTilesByMap.delete(mapId);
      this.runtimeBlockedTilesByMap.delete(mapId);
      this.room.mapEntitySystem.clearMap(mapId);
      this.room.state.maps.delete(String(mapId));
    }
  }
}
