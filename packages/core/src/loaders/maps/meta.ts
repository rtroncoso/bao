import { LayeredTile } from '@bao/core/models';

import { isInteriorSpawnTile, isWithinWorldMap, toWorldCoords } from './coords';

export interface MapNpcSpawn {
  npcId: number;
  x: number;
  y: number;
}

export interface MapObjectSpawn {
  objectId: number;
  amount: number;
  x: number;
  y: number;
}

export interface MapTileExit {
  x: number;
  y: number;
  targetMapId: number;
  targetX: number;
  targetY: number;
}

export interface MapMeta {
  mapId: number;
  npcs: MapNpcSpawn[];
  objects: MapObjectSpawn[];
  tileExits: MapTileExit[];
}

/**
 * Extracts server-authoritative spawn data from parsed map tiles.
 */
export const extractMapMeta = (mapId: number, tiles: LayeredTile[][]): MapMeta => {
  const npcs: MapNpcSpawn[] = [];
  const objects: MapObjectSpawn[] = [];
  const tileExits: MapTileExit[] = [];

  for (const row of tiles) {
    for (const tile of row) {
      if (!tile) {
        continue;
      }

      if (tile.npc) {
        const { x, y } = toWorldCoords(tile.x, tile.y);
        if (isInteriorSpawnTile(x, y)) {
          npcs.push({
            npcId: tile.npc.id,
            x,
            y,
          });
        }
      }

      if (tile.object) {
        const { x, y } = toWorldCoords(tile.x, tile.y);
        if (isInteriorSpawnTile(x, y)) {
          objects.push({
            objectId: tile.object.id,
            amount: tile.object.amount,
            x,
            y,
          });
        }
      }

      if (tile.tileExit) {
        const { x, y } = toWorldCoords(tile.x, tile.y);
        const target = toWorldCoords(tile.tileExit.x, tile.tileExit.y);
        if (isWithinWorldMap(x, y)) {
          tileExits.push({
            x,
            y,
            targetMapId: tile.tileExit.map,
            targetX: target.x,
            targetY: target.y,
          });
        }
      }
    }
  }

  return { mapId, npcs, objects, tileExits };
};
