import { MapSpawnService } from '@/services/MapSpawnService';
import { WorldRoom } from '@/rooms/WorldRoom';

export interface TileExitRecord {
  targetMapId: number;
  targetX: number;
  targetY: number;
}

export class MapRegistry {
  private readonly mapSpawnService = new MapSpawnService();
  private readonly loadedMaps = new Set<number>();
  private readonly mapRefCounts = new Map<number, number>();
  private readonly tileExitsByMap = new Map<number, Map<string, TileExitRecord>>();

  constructor(private readonly room: WorldRoom) {}

  private exitKey(x: number, y: number) {
    return `${x}:${y}`;
  }

  async ensureMap(mapId: number, authToken?: string) {
    if (this.loadedMaps.has(mapId)) {
      return;
    }

    const spawns = await this.mapSpawnService.fetchSpawns(mapId, authToken);
    const exitIndex = new Map<string, TileExitRecord>();

    for (const exit of spawns.tileExits) {
      exitIndex.set(this.exitKey(exit.x, exit.y), {
        targetMapId: exit.targetMapId,
        targetX: exit.targetX,
        targetY: exit.targetY,
      });
    }

    this.tileExitsByMap.set(mapId, exitIndex);
    this.loadedMaps.add(mapId);
    await this.room.mapEntitySystem.hydrateMap(mapId, authToken);
  }

  registerCharacter(mapId: number) {
    this.mapRefCounts.set(mapId, (this.mapRefCounts.get(mapId) ?? 0) + 1);
  }

  unregisterCharacter(mapId: number) {
    const next = (this.mapRefCounts.get(mapId) ?? 1) - 1;
    if (next <= 0) {
      this.mapRefCounts.delete(mapId);
      this.loadedMaps.delete(mapId);
      this.tileExitsByMap.delete(mapId);
      this.room.state.maps.delete(String(mapId));
      return;
    }

    this.mapRefCounts.set(mapId, next);
  }

  getTileExit(mapId: number, x: number, y: number): TileExitRecord | null {
    return this.tileExitsByMap.get(mapId)?.get(this.exitKey(x, y)) ?? null;
  }
}
