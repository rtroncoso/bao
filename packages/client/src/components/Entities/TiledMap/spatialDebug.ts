import type { Rectangle } from 'pixi.js';

import type { Tiled } from '@bao/core';

import type { SpatialBounds } from './spatial';

export interface SpatialDebugSnapshot {
  tmx: Tiled;
  tileCullingPx: number;
  objectCullingPx: number;
  cellSize: number;
  spriteQueryCount: number;
  objectQueryCount: number;
  mapWorldOffset: { x: number; y: number };
  characterPosition?: {
    mapId: number;
    x: number;
    y: number;
    worldX: number;
    worldY: number;
  };
  /** Viewport used for sprite culling in world space. */
  cullProjection: Rectangle;
  tileBounds: SpatialBounds;
  spriteBounds: SpatialBounds;
  objectBounds: SpatialBounds;
}

/** Latest SHG culling context — written by the active map's viewport pass only. */
export const spatialDebugRef: { current: SpatialDebugSnapshot | null } = {
  current: null
};

export const offsetBounds = (
  bounds: SpatialBounds,
  offsetX: number,
  offsetY: number
): SpatialBounds => ({
  x: bounds.x + offsetX,
  y: bounds.y + offsetY,
  width: bounds.width,
  height: bounds.height
});
