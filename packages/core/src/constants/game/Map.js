export const HEADER_SIZE = 263 + (2 * 5);
export const INF_HEADER_SIZE = 6;

export const MAP_LAYERS = 4;
export const WATER_LAYER = 0;
export const TILES_LAYER = 1;
export const DETAILS_LAYER = 2;
export const ENTITIES_LAYER = 3;
export const UPPER_LAYER = 4;
export const COLLISION_LAYER = TILES_LAYER;
export const TILE_EXIT_LAYER = TILES_LAYER;
export const OBJECT_LAYER = ENTITIES_LAYER;
export const NPC_LAYER = ENTITIES_LAYER;
export const TRIGGER_LAYER = UPPER_LAYER;

export const NO_TRIGGER = 0;
export const TRIGGER_ROOF = 1;
export const TRIGGER_2 = 2;
export const TRIGGER_INVALID = 3;
export const TRIGGER_SAFE = 4;
export const TRIGGER_MOYANO = 5;
export const TRIGGER_DUEL = 6;

export const MAP_SIZE = 100;
export const MAP_BORDER_X = 8;
export const MAP_BORDER_Y = 6;
export const TILED_MAP_WIDTH = MAP_SIZE - MAP_BORDER_X * 2;
export const TILED_MAP_HEIGHT = MAP_SIZE - MAP_BORDER_Y * 2;
export const TILED_MAP_SIZE = [TILED_MAP_WIDTH, TILED_MAP_HEIGHT];
export const TILE_SIZE = 32;
export const PRELOAD = 5;

export const ANIMATION_TYPE = 'animation';
export const SPRITE_TYPE = 'sprite';
export const CHARACTER_TYPE = 'character';
export const COLLISION_TYPE = 'collision';
export const TILE_EXIT_TYPE = 'tileExit';
export const TRIGGER_TYPE = 'trigger';
export const WATER_TYPE = 'water';
export const OBJECT_TYPE = 'object';
export const NPC_TYPE = 'npc';

export default null;
