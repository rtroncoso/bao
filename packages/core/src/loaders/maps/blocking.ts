import {
  COLLISION_TYPE,
  MAP_BORDER_X,
  MAP_BORDER_Y,
  NPC_TYPE,
  OBJECT_TYPE,
  TILED_MAP_SIZE,
  TILE_SIZE,
} from '@bao/core/constants/game/Map';
import {
  cropLayer,
  makeCollisionLayer,
  makeNpcsLayer,
  makeObjectsLayer,
} from '@bao/core/loaders/maps/tmx/converter';
import { isPlayableTile, toWorldCoords } from '@bao/core/loaders/maps/coords';
import { GroupLayer, Tile, TmxObject } from '@bao/core/models';

export interface BlockedTile {
  x: number;
  y: number;
}

export const rasterizeRectToTiles = (
  x: number,
  y: number,
  width: number,
  height: number,
  tiles: Set<string>
) => {
  if (width <= 0 || height <= 0) {
    return;
  }

  const x0 = Math.max(0, Math.floor(x / TILE_SIZE));
  const y0 = Math.max(0, Math.floor(y / TILE_SIZE));
  const x1 = Math.min(
    TILED_MAP_SIZE[0] - 1,
    Math.floor((x + width - 1) / TILE_SIZE)
  );
  const y1 = Math.min(
    TILED_MAP_SIZE[1] - 1,
    Math.floor((y + height - 1) / TILE_SIZE)
  );

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      tiles.add(`${tx},${ty}`);
    }
  }
};

const collectShapes = (groupLayer: GroupLayer): TmxObject[] =>
  groupLayer?.layers?.[0]?.objects ?? [];

/**
 * Rasterizes terrain collision (packed polygons), object footprints, and NPC
 * tiles from map layers into world tile coordinates.
 */
export const extractBlockedTilesFromLayers = (
  layers: Tile[][][]
): BlockedTile[] => {
  const croppedLayers = layers.map((layer) =>
    cropLayer({
      layer,
      x1: MAP_BORDER_X - 1,
      y1: MAP_BORDER_Y - 1,
      x2: TILED_MAP_SIZE[0],
      y2: TILED_MAP_SIZE[1],
    })
  );

  const collisionLayer = makeCollisionLayer({ layers: croppedLayers });
  const npcsLayer = makeNpcsLayer({ layers: croppedLayers });
  const objectsLayer = makeObjectsLayer({ layers: croppedLayers });

  const tileSet = new Set<string>();
  const shapes = [
    ...collectShapes(collisionLayer),
    ...collectShapes(npcsLayer),
    ...collectShapes(objectsLayer),
  ];

  for (const shape of shapes) {
    if (
      shape.type !== COLLISION_TYPE &&
      shape.type !== NPC_TYPE &&
      shape.type !== OBJECT_TYPE
    ) {
      continue;
    }

    rasterizeRectToTiles(shape.x, shape.y, shape.width, shape.height, tileSet);
  }

  return Array.from(tileSet, (key) => {
    const [croppedX, croppedY] = key.split(',').map(Number);
    const world = toWorldCoords(
      croppedX + (MAP_BORDER_X - 1),
      croppedY + (MAP_BORDER_Y - 1)
    );
    return world;
  }).filter(({ x, y }) => isPlayableTile(x, y));
};
