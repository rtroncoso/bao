import { createSelector } from 'reselect';

import { getEntities } from '@bao/client/queries';

export const selectAnimations = createSelector(
  getEntities,
  (entities) => entities.animations
);

export const selectBodies = createSelector(
  getEntities,
  (entities) => entities.bodies
);

export const selectHeads = createSelector(
  getEntities,
  (entities) => entities.heads
);

export const selectGraphics = createSelector(
  getEntities,
  (entities) => entities.graphics
);

export const selectManifest = createSelector(
  getEntities,
  (entities) => entities.manifest
);
