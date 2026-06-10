import { LayeredTile } from '@bao/core/models';

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
        npcs.push({
          npcId: tile.npc.id,
          x: tile.x,
          y: tile.y,
        });
      }

      if (tile.object) {
        objects.push({
          objectId: tile.object.id,
          amount: tile.object.amount,
          x: tile.x,
          y: tile.y,
        });
      }

      if (tile.tileExit) {
        tileExits.push({
          x: tile.x,
          y: tile.y,
          targetMapId: tile.tileExit.map,
          targetX: tile.tileExit.x,
          targetY: tile.tileExit.y,
        });
      }
    }
  }

  return { mapId, npcs, objects, tileExits };
};
