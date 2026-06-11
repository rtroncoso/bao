import {
  MAP_BORDER_X,
  MAP_BORDER_Y,
  TILED_MAP_SIZE,
} from '@bao/core/constants/game/Map';
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

/** Tile inside the cropped world map (including edge margins used by exits). */
export const isWithinWorldMap = isPlayableTile;

/** Interior spawn tile — excludes border strips used for map transitions. */
export const isInteriorSpawnTile = (x: number, y: number) =>
  x > MAP_BORDER_X &&
  y > MAP_BORDER_Y &&
  x < TILED_MAP_SIZE[0] - MAP_BORDER_X - 1 &&
  y < TILED_MAP_SIZE[1] - MAP_BORDER_Y - 1;

/** NPC or ground-object spawn markers — server-only, never baked into client maps. */
export const isServerSpawnTile = (tile: Pick<Tile, 'npc' | 'object'> | null | undefined) =>
  !!(tile?.npc || tile?.object);
