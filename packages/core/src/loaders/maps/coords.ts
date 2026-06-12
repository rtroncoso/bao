import {
  MAP_BORDER_X,
  MAP_BORDER_Y,
  TILED_MAP_SIZE,
} from '@bao/core/constants/game/Map';
import { isServerRenderedObject } from '@bao/core/constants/game/Object';
import { Tile } from '@bao/core/models';

/**
 * Convert legacy 100×100 map grid coords to world (playable) tile coords.
 * Applied once when extracting meta / seeding — not used at runtime.
 */
export const toWorldCoords = (x: number, y: number) => ({
  x: x - MAP_BORDER_X,
  y: y - MAP_BORDER_Y,
});

/** @deprecated use toWorldCoords */
export const aoToPlayable = toWorldCoords;

export const isPlayableTile = (x: number, y: number) =>
  x >= 0 && y >= 0 && x < TILED_MAP_SIZE[0] && y < TILED_MAP_SIZE[1];

/** Clamp map-local tile coords to the playable grid (matches API position validator). */
export const clampPlayableTile = (x: number, y: number) => ({
  x: Math.min(TILED_MAP_SIZE[0] - 1, Math.max(0, Math.floor(x))),
  y: Math.min(TILED_MAP_SIZE[1] - 1, Math.max(0, Math.floor(y))),
});

/** Crop origin in legacy 100×100 map grid indices (inclusive). */
export const CROP_ORIGIN_X = MAP_BORDER_X - 1;
export const CROP_ORIGIN_Y = MAP_BORDER_Y - 1;

/**
 * Legacy 1-indexed AO grid coords → playable tile coords after map crop.
 * Playable raster indices from `cropLayer` match this space (character.tile).
 */
export const legacyToPlayable = (legacyX: number, legacyY: number) =>
  toWorldCoords(legacyX, legacyY);

/** Playable tile coords → legacy grid coords (inverse of legacyToPlayable). */
export const playableToLegacy = (playableX: number, playableY: number) => ({
  x: playableX + MAP_BORDER_X,
  y: playableY + MAP_BORDER_Y,
});

/** Tile inside the cropped world map (including edge margins used by exits). */
export const isWithinWorldMap = isPlayableTile;

/** Interior spawn tile — excludes border strips used for map transitions. */
export const isInteriorSpawnTile = (x: number, y: number) =>
  x > MAP_BORDER_X &&
  y > MAP_BORDER_Y &&
  x < TILED_MAP_SIZE[0] - MAP_BORDER_X - 1 &&
  y < TILED_MAP_SIZE[1] - MAP_BORDER_Y - 1;

/** NPC or server-rendered object spawn markers — not baked into client maps. */
export const isServerSpawnTile = (tile: Pick<Tile, 'npc' | 'object'> | null | undefined) => {
  if (!tile) {
    return false;
  }
  if (tile.npc) {
    return true;
  }
  return !!(tile.object && isServerRenderedObject(Number(tile.object.type)));
};
