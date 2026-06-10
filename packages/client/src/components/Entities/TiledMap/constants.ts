import { PRELOAD, TILE_SIZE } from '@bao/core';

export const POOL_SIZES = {
  ANIMATIONS: 2000,
  SPRITES: 3000
} as const;

/** Spatial hash cell size in tiles (4 tiles = 128px at 32px/tile). */
export const SPATIAL_CELL_SIZE_TILES = 4;

/** Tile layer chunk size in tiles for viewport caching. */
export const TILE_CHUNK_SIZE_TILES = 16;

/** Extra chunks retained around the viewport before eviction. */
export const TILE_CHUNK_CACHE_MARGIN = 2;

/** Symmetric tile margin added on every side of the viewport for tile layers. */
export const TILE_CULLING_TILES = PRELOAD;

/**
 * Symmetric tile margin for sprites/objects. Wider than tiles to account for
 * graphic offsets, large sprites, and camera lerp between tile invalidations.
 */
export const OBJECT_CULLING_TILES = PRELOAD * 2;

/** TMX object layer id for shoreline sprite strips (game layer 2). */
export const TMX_SHORE_SPRITE_LAYER = 2;

/** Shore shader + filter band width in tiles (2 = two tile deep edge). */
export const SHORE_EDGE_TILES = 2;

/** Slight stretch toward water to hide filter seams between adjacent shore tiles. */
export const SHORE_SPRITE_OVERLAP_SCALE = 1.1;

/** Extra padding for shore sprite SHG/cull bounds (anchor + overlap extend past tile). */
export const SHORE_SPRITE_CULL_PADDING =
  Math.ceil(TILE_SIZE * (SHORE_SPRITE_OVERLAP_SCALE - 1)) + TILE_SIZE * 0.5;

/** Additional viewport margin when querying shore sprites. */
export const SHORE_SPRITE_EXTRA_CULL_PX = TILE_SIZE * 2;

/** 0-based index of the TMX shore tile layer ("Tile Layer 2"). */
export const SHORE_TILE_LAYER_INDEX = 1;

export const ANIMATION_CONFIG = {
  ROOF_FADE_DURATION: 500,
  ALPHA_VISIBLE: 1.0,
  ALPHA_HIDDEN: 0.0
} as const;

export const COLLISION_CONFIG = {
  TRIGGER_TOLERANCE: 0.2,
  BOX_POLYGON_TOLERANCE: 0.1
} as const;
