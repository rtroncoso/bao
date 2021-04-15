import { createSelector } from 'reselect';

import { getEntities } from '@mob/client/queries';

export const selectBodies = createSelector(
  getEntities,
  (entities) => entities.bodies
);

export const selectGraphics = createSelector(
  getEntities,
  (entities) => entities.graphics
);

export const selectManifest = createSelector(
  getEntities,
  (entities) => entities.manifest
);
