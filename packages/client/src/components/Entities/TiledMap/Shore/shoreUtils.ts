import { pointPolygon } from 'intersects';

import { getProperty, TILE_SIZE, TileLayer, TmxObject } from '@bao/core';
import { polygon } from '@bao/client/utils';
import { Sprite } from 'pixi.js';

import {
  TMX_SHORE_SPRITE_LAYER,
  SHORE_SPRITE_OVERLAP_SCALE
} from '../constants';

import { getObjectRenderBounds, ObjectRenderBounds } from '../utils';
import { getWaterPolygons, WaterPolygon } from './waterPolygons';

/** Distance from sprite edge to probe for adjacent water. */
const WATER_PROBE_PX = TILE_SIZE * 0.5;

/** Step size when marching from a shore edge to find dry land. */
const DRY_LAND_STEP_PX = 4;

/** Max march distance — must reach past wide water polygons that cover shore strips. */
const DRY_LAND_MAX_PX = TILE_SIZE * 16;

/** Ignore short west/north exits when the sprite sits on the map border. */
const MAP_EDGE_CLAMP_PX = TILE_SIZE;

/** Minimum land-distance gap before picking a water-facing side. */
const DIRECTION_MARGIN_PX = 4;

/** Samples taken along each sprite edge (large shore strips need more than center probe). */
const EDGE_SAMPLES = 5;

type AxisSide = 'negative' | 'positive';

export interface ShoreEdges {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export const shoreEdgesToBitmask = (edges: ShoreEdges): number =>
  (edges.top ? 1 : 0) |
  (edges.right ? 2 : 0) |
  (edges.bottom ? 4 : 0) |
  (edges.left ? 8 : 0);

export const shoreBitmaskToUniform = (
  mask: number
): [number, number, number, number] => [
  mask & 1 ? 1 : 0,
  mask & 2 ? 1 : 0,
  mask & 4 ? 1 : 0,
  mask & 8 ? 1 : 0
];

export const hasShoreEdges = (edges: ShoreEdges): boolean =>
  edges.top || edges.right || edges.bottom || edges.left;

const isPointInWater = (
  x: number,
  y: number,
  waterPolygons: WaterPolygon[]
): boolean => {
  for (const waterPolygon of waterPolygons) {
    if (waterPolygon.length < 3) {
      continue;
    }

    if (pointPolygon(x, y, polygon(waterPolygon), 0.05)) {
      return true;
    }
  }

  return false;
};

const edgeTouchesWater = (
  probes: Array<{ x: number; y: number }>,
  waterPolygons: WaterPolygon[]
): boolean => probes.some(({ x, y }) => isPointInWater(x, y, waterPolygons));

/** March from a shore edge outward until leaving the water polygon. */
const distanceToDryLandFromEdge = (
  edgeX: number,
  edgeY: number,
  dirX: number,
  dirY: number,
  waterPolygons: WaterPolygon[]
): number => {
  let distance = WATER_PROBE_PX;

  while (distance < DRY_LAND_MAX_PX) {
    if (
      !isPointInWater(
        edgeX + dirX * distance,
        edgeY + dirY * distance,
        waterPolygons
      )
    ) {
      return distance;
    }

    distance += DRY_LAND_STEP_PX;
  }

  return DRY_LAND_MAX_PX;
};

/**
 * Pick which side faces open water. Land is the direction that reaches dry ground
 * sooner; map-edge exits on the west/north border are ignored when they are
 * closer than a real coastline.
 */
const resolveWaterSide = (
  nearNegative: boolean,
  nearPositive: boolean,
  landBeyondPositive: number,
  landBeyondNegative: number,
  negativeBoundary: number
): AxisSide | null => {
  if (nearNegative && !nearPositive) {
    return 'negative';
  }

  if (!nearNegative && nearPositive) {
    return negativeBoundary < MAP_EDGE_CLAMP_PX ? 'negative' : 'positive';
  }

  if (!nearNegative && !nearPositive) {
    return null;
  }

  const credibleNegativeLand =
    landBeyondNegative < negativeBoundary + MAP_EDGE_CLAMP_PX
      ? Number.POSITIVE_INFINITY
      : landBeyondNegative;

  if (landBeyondPositive < credibleNegativeLand - DIRECTION_MARGIN_PX) {
    return 'negative';
  }

  if (credibleNegativeLand < landBeyondPositive - DIRECTION_MARGIN_PX) {
    return 'positive';
  }

  return null;
};

const sampleEdgePoints = (
  start: number,
  end: number,
  fixedCoord: 'x' | 'y',
  fixedValue: number,
  offset: number
): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];

  for (let index = 0; index < EDGE_SAMPLES; index++) {
    const t = index / Math.max(EDGE_SAMPLES - 1, 1);
    const along = start + (end - start) * t;

    if (fixedCoord === 'x') {
      points.push({ x: fixedValue + offset, y: along });
    } else {
      points.push({ x: along, y: fixedValue + offset });
    }
  }

  return points;
};

const getNearWaterProbes = (
  bounds: ObjectRenderBounds,
  waterPolygons: WaterPolygon[]
): {
  centerX: number;
  centerY: number;
  centerInWater: boolean;
  near: { top: boolean; right: boolean; bottom: boolean; left: boolean };
} => {
  const left = bounds.x;
  const right = bounds.x + bounds.width;
  const top = bounds.y;
  const bottom = bounds.y + bounds.height;
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;

  return {
    centerX,
    centerY,
    centerInWater: isPointInWater(centerX, centerY, waterPolygons),
    near: {
      top: edgeTouchesWater(
        sampleEdgePoints(left, right, 'y', top, -WATER_PROBE_PX),
        waterPolygons
      ),
      right: edgeTouchesWater(
        sampleEdgePoints(top, bottom, 'x', right, WATER_PROBE_PX),
        waterPolygons
      ),
      bottom: edgeTouchesWater(
        sampleEdgePoints(left, right, 'y', bottom, WATER_PROBE_PX),
        waterPolygons
      ),
      left: edgeTouchesWater(
        sampleEdgePoints(top, bottom, 'x', left, -WATER_PROBE_PX),
        waterPolygons
      )
    }
  };
};

export const getShoreEdgesForBounds = (
  bounds: ObjectRenderBounds,
  waterPolygons: WaterPolygon[]
): ShoreEdges => {
  if (!waterPolygons.length) {
    return { top: false, right: false, bottom: false, left: false };
  }

  const left = bounds.x;
  const right = bounds.x + bounds.width;
  const top = bounds.y;
  const bottom = bounds.y + bounds.height;
  const { centerX, centerY, centerInWater, near } = getNearWaterProbes(
    bounds,
    waterPolygons
  );

  if (!centerInWater) {
    return {
      left: near.left && !near.right,
      right: near.right && !near.left,
      top: near.top && !near.bottom,
      bottom: near.bottom && !near.top
    };
  }

  const edges: ShoreEdges = {
    top: false,
    right: false,
    bottom: false,
    left: false
  };

  const horizontalSide = resolveWaterSide(
    near.left,
    near.right,
    distanceToDryLandFromEdge(right, centerY, 1, 0, waterPolygons),
    distanceToDryLandFromEdge(left, centerY, -1, 0, waterPolygons),
    left
  );

  if (horizontalSide === 'negative') {
    edges.left = true;
  } else if (horizontalSide === 'positive') {
    edges.right = true;
  }

  const horizontalEdge = edges.left || edges.right;

  const skipVerticalDistance =
    horizontalEdge && edges.left && left < MAP_EDGE_CLAMP_PX * 2;

  if (near.top && near.bottom && !skipVerticalDistance) {
    const verticalSide = resolveWaterSide(
      near.top,
      near.bottom,
      distanceToDryLandFromEdge(centerX, bottom, 0, 1, waterPolygons),
      distanceToDryLandFromEdge(centerX, top, 0, -1, waterPolygons),
      top
    );

    if (verticalSide === 'negative') {
      edges.top = true;
    } else if (verticalSide === 'positive') {
      edges.bottom = true;
    }
  } else if (!horizontalEdge) {
    const verticalSide = resolveWaterSide(
      near.top,
      near.bottom,
      DRY_LAND_MAX_PX,
      DRY_LAND_MAX_PX,
      top
    );

    if (verticalSide === 'negative') {
      edges.top = true;
    } else if (verticalSide === 'positive') {
      edges.bottom = true;
    }
  }

  if (left < MAP_EDGE_CLAMP_PX && !edges.right) {
    edges.left = true;
  }

  if (top < MAP_EDGE_CLAMP_PX && !edges.bottom) {
    edges.top = true;
  }

  return edges;
};

export const getShoreEdgesForTile = (
  tileX: number,
  tileY: number,
  waterPolygons: WaterPolygon[]
): ShoreEdges =>
  getShoreEdgesForBounds(
    {
      x: tileX * TILE_SIZE,
      y: tileY * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE
    },
    waterPolygons
  );

/** All TMX shore-layer sprites → edge mask (may be zero when no water neighbor). */
export const getShoreOrientations = (
  sprites: TmxObject[],
  water: TmxObject[]
): Map<string | number, ShoreEdges> => {
  const orientations = new Map<string | number, ShoreEdges>();
  const waterPolygons = getWaterPolygons(water);

  sprites.forEach((sprite) => {
    if (Number(getProperty(sprite, 'layer')) !== TMX_SHORE_SPRITE_LAYER) {
      return;
    }

    orientations.set(
      sprite.id,
      waterPolygons.length
        ? getShoreEdgesForBounds(getObjectRenderBounds(sprite), waterPolygons)
        : { top: false, right: false, bottom: false, left: false }
    );
  });

  return orientations;
};

/** Tile coordinate key → edge mask for shore tile layer cells. */
export const getShoreTileOrientations = (
  shoreLayer: TileLayer,
  mapWidth: number,
  water: TmxObject[]
): Map<string, number> => {
  const orientations = new Map<string, number>();
  const waterPolygons = getWaterPolygons(water);

  if (!waterPolygons.length || !shoreLayer?.data?.length) {
    return orientations;
  }

  for (
    let tileY = 0;
    tileY < Math.ceil(shoreLayer.data.length / mapWidth);
    tileY++
  ) {
    for (let tileX = 0; tileX < mapWidth; tileX++) {
      const index = tileY * mapWidth + tileX;
      if (shoreLayer.data[index] <= 0) {
        continue;
      }

      const mask = shoreEdgesToBitmask(
        getShoreEdgesForTile(tileX, tileY, waterPolygons)
      );

      if (mask > 0) {
        orientations.set(`${tileX},${tileY}`, mask);
      }
    }
  }

  return orientations;
};

export const getShoreOrientation = (
  orientations: Map<string | number, ShoreEdges>,
  id: string | number
): ShoreEdges | undefined =>
  orientations.get(id) ??
  orientations.get(String(id)) ??
  orientations.get(Number(id));

/** Map-space top-left of the shore tile grid cell (stable across anchor changes). */
export const getShoreTileOrigin = (
  sprite: Sprite
): { x: number; y: number } => ({
  x: sprite.x - sprite.anchor.x * TILE_SIZE,
  y: sprite.y - sprite.anchor.y * TILE_SIZE
});

/**
 * Stretch a shore tile slightly toward adjacent water so filter seams overlap.
 * Land-facing edges stay grid-aligned; scale grows only on water-contact axes.
 */
export const applyShoreSpriteOverlap = (
  sprite: Sprite,
  edges: ShoreEdges,
  tileX: number,
  tileY: number,
  overlapScale = SHORE_SPRITE_OVERLAP_SCALE
): void => {
  sprite.anchor.set(0, 0);
  sprite.position.set(tileX, tileY);
  sprite.width = TILE_SIZE;
  sprite.height = TILE_SIZE;

  const overlapX = edges.left || edges.right ? overlapScale : 1;
  const overlapY = edges.top || edges.bottom ? overlapScale : 1;

  if (overlapX === 1 && overlapY === 1) {
    return;
  }

  const baseScaleX = sprite.scale.x;
  const baseScaleY = sprite.scale.y;

  let anchorX = 0;
  let anchorY = 0;

  if (edges.left && !edges.right) {
    anchorX = 1;
  } else if (edges.left && edges.right) {
    anchorX = 0.5;
  }

  if (edges.top && !edges.bottom) {
    anchorY = 1;
  } else if (edges.top && edges.bottom) {
    anchorY = 0.5;
  }

  sprite.anchor.set(anchorX, anchorY);
  sprite.position.set(tileX + anchorX * TILE_SIZE, tileY + anchorY * TILE_SIZE);
  sprite.scale.set(baseScaleX * overlapX, baseScaleY * overlapY);
};
