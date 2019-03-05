import _ from 'lodash';
import { createSelector } from 'reselect';

export const selectAssetState = state => state.Asset;

export const selectAnimations = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.animations')
);

export const selectTextures = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.textures')
);

export const selectSpriteSheets = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.spriteSheets')
);

export const selectResources = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.resources')
);

export const selectGraphics = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.graphics')
);

export const selectBodies = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.bodies')
);

export const selectWeapons = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.weapons')
);

export const selectShields = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.shields')
);

export const selectHelmets = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.helmets')
);

export const selectHeads = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.heads')
);

export const selectEffects = createSelector(
  selectAssetState,
  state => _.get(state, 'assets.effects')
);

export const selectLoadingState = createSelector(
  selectAssetState,
  state => state.isLoading,
);
