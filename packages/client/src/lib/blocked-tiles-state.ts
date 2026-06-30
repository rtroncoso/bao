import { MapBlockedTile, TILED_MAP_SIZE } from '@bao/core';
import { CharacterState } from '@bao/server/schema/CharacterState';

import { fetchAssetJson } from '@bao/client/lib/baoUrls';

const tileKey = (mapId: number, x: number, y: number) => `${mapId}:${x}:${y}`;

export interface MovementCollision {
  isTileBlocked: (mapId: number, tileX: number, tileY: number) => boolean;
}

class BlockedTilesState implements MovementCollision {
  private staticByMap = new Map<number, Set<string>>();
  private loadingByMap = new Map<number, Promise<void>>();
  private occupiedByMap = new Map<number, Set<string>>();

  async ensureMapLoaded(mapId: number, mapJsonPath: string) {
    if (this.staticByMap.has(mapId)) {
      return;
    }

    const pending = this.loadingByMap.get(mapId);
    if (pending) {
      await pending;
      return;
    }

    const load = this.loadMapMeta(mapId, mapJsonPath);
    this.loadingByMap.set(mapId, load);

    try {
      await load;
    } finally {
      this.loadingByMap.delete(mapId);
    }
  }

  private async loadMapMeta(mapId: number, mapJsonPath: string) {
    const metaPath = mapJsonPath.replace(/\.json$/i, '.meta.json');
    const meta = await fetchAssetJson<{ blockedTiles?: MapBlockedTile[] }>(
      metaPath
    );
    const keys = new Set<string>();

    for (const tile of meta?.blockedTiles ?? []) {
      keys.add(tileKey(mapId, tile.x, tile.y));
    }

    this.staticByMap.set(mapId, keys);
  }

  syncOccupancy(
    characters: Iterable<CharacterState> | undefined | null,
    localSessionId: string | undefined
  ) {
    this.occupiedByMap.clear();

    if (!characters) {
      return;
    }

    for (const character of characters) {
      if (!character.sessionId || character.sessionId === localSessionId) {
        continue;
      }

      if (character.mapId === undefined || character.mapId === null) {
        continue;
      }

      const mapId = character.mapId;
      let occupied = this.occupiedByMap.get(mapId);
      if (!occupied) {
        occupied = new Set<string>();
        this.occupiedByMap.set(mapId, occupied);
      }

      occupied.add(tileKey(mapId, character.tile.x, character.tile.y));
    }
  }

  isTileBlocked(mapId: number, tileX: number, tileY: number) {
    const [width, height] = TILED_MAP_SIZE;
    if (tileX < 0 || tileY < 0 || tileX >= width || tileY >= height) {
      return true;
    }

    const key = tileKey(mapId, tileX, tileY);
    if (this.staticByMap.get(mapId)?.has(key)) {
      return true;
    }

    return this.occupiedByMap.get(mapId)?.has(key) ?? false;
  }

  clear() {
    this.staticByMap.clear();
    this.loadingByMap.clear();
    this.occupiedByMap.clear();
  }
}

export const blockedTilesState = new BlockedTilesState();
