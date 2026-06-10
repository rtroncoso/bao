import { ArraySchema } from '@colyseus/schema';

import {
  MapNpcEntityState,
  MapObjectEntityState
} from '@/schema/MapEntityState';
import { MapState } from '@/schema/MapState';
import { MapSpawnService } from '@/services/MapSpawnService';
import { WorldRoom } from '@/rooms/WorldRoom';

export class MapEntitySystem {
  private readonly room: WorldRoom;
  private readonly mapSpawnService = new MapSpawnService();
  private readonly loadedMaps = new Set<number>();

  constructor(room: WorldRoom) {
    this.room = room;
  }

  async hydrateMap(mapId: number, authToken?: string) {
    if (this.loadedMaps.has(mapId)) {
      return this.room.state.maps.get(String(mapId));
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
        entity.graphicId = spawn.npcId;
        entity.x = spawn.x;
        entity.y = spawn.y;
        return entity;
      })
    );

    mapState.objects = new ArraySchema<MapObjectEntityState>(
      ...spawns.objects.map((spawn, index) => {
        const entity = new MapObjectEntityState();
        entity.id = `object:${mapId}:${index}`;
        entity.objectId = spawn.objectId;
        entity.graphicId = spawn.objectId;
        entity.amount = spawn.amount;
        entity.x = spawn.x;
        entity.y = spawn.y;
        return entity;
      })
    );

    this.room.state.maps.set(String(mapId), mapState);
    this.loadedMaps.add(mapId);
    return mapState;
  }
}
