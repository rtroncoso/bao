import { createAction } from 'redux-actions';
import { createReducers } from 'redux-arc';

export const LOADING_COMPLETE = 'mob/asset/LOADING_COMPLETE';
export const LOADING_START = 'mob/asset/LOADING_START';
export const UPDATE_GRAPHICS = 'mob/asset/UPDATE_GRAPHICS';
export const UPDATE_SPRITESHEETS = 'mob/asset/UPDATE_SPRITESHEETS';
export const UPDATE_RESOURCES = 'mob/asset/UPDATE_RESOURCES';
export const UPDATE_TEXTURES = 'mob/asset/UPDATE_TEXTURES';
export const UPDATE_ANIMATIONS = 'mob/asset/UPDATE_ANIMATIONS';
export const UPDATE_BODIES = 'mob/asset/UPDATE_BODIES';
export const UPDATE_WEAPONS = 'mob/asset/UPDATE_WEAPONS';
export const UPDATE_SHIELDS = 'mob/asset/UPDATE_SHIELDS';
export const UPDATE_HELMETS = 'mob/asset/UPDATE_HELMETS';
export const UPDATE_HEADS = 'mob/asset/UPDATE_HEADS';
export const UPDATE_EFFECTS = 'mob/asset/UPDATE_EFFECTS';

export const loadingStart = createAction(LOADING_START);
export const loadingComplete = createAction(LOADING_COMPLETE);
export const updateGraphics = createAction(UPDATE_GRAPHICS);
export const updateSpriteSheets = createAction(UPDATE_SPRITESHEETS);
export const updateResources = createAction(UPDATE_RESOURCES);
export const updateTextures = createAction(UPDATE_TEXTURES);
export const updateAnimations = createAction(UPDATE_ANIMATIONS);
export const updateBodies = createAction(UPDATE_BODIES);
export const updateWeapons = createAction(UPDATE_WEAPONS);
export const updateShields = createAction(UPDATE_SHIELDS);
export const updateHelmets = createAction(UPDATE_HELMETS);
export const updateHeads = createAction(UPDATE_HEADS);
export const updateEffects = createAction(UPDATE_EFFECTS);

export const defaultLoaderState = {
  isLoading: false,
};

export const defaultState = {
  ...defaultLoaderState,
  assets: {
    graphics: {},
    textures: [],
    animations: [],
    resources: {},
    spriteSheets: {},
    effects: {},
    bodies: {},
    weapons: {},
    shields: {},
    helmets: {},
    heads: {},
  }
};

export const handleUpdate = type => (state, action) => ({
  ...state,
  assets: {
    ...state.assets,
    [type]: action.payload
  }
});

export const HANDLERS = {
  [LOADING_START]: (state, action) => ({ ...state, isLoading: true }),
  [LOADING_COMPLETE]: (state, action) => ({
    ...state,
    isLoading: false,
    assets: {
      ...state.assets,
      resources: action.payload
    }
  }),
  [UPDATE_GRAPHICS]: handleUpdate('graphics'),
  [UPDATE_SPRITESHEETS]: handleUpdate('spriteSheets'),
  [UPDATE_RESOURCES]: handleUpdate('resources'),
  [UPDATE_TEXTURES]: handleUpdate('textures'),
  [UPDATE_ANIMATIONS]: handleUpdate('animations'),
  [UPDATE_BODIES]: handleUpdate('bodies'),
  [UPDATE_WEAPONS]: handleUpdate('weapons'),
  [UPDATE_SHIELDS]: handleUpdate('shields'),
  [UPDATE_HELMETS]: handleUpdate('helmets'),
  [UPDATE_HEADS]: handleUpdate('heads'),
  [UPDATE_EFFECTS]: handleUpdate('effects'),
};

export default createReducers(defaultState, HANDLERS);
