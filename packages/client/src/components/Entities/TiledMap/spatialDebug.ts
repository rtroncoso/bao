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
  /** Last published viewport used for sprite culling (updates on tile step). */
  cullProjection: Rectangle;
  tileBounds: SpatialBounds;
  spriteBounds: SpatialBounds;
  objectBounds: SpatialBounds;
}

/** Latest SHG culling context — counts/bounds refresh on tile steps; portal reads live projection. */
export const spatialDebugRef: { current: SpatialDebugSnapshot | null } = {
  current: null
};
