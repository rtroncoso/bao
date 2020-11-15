import { createSelector } from 'reselect';
import { getEntities } from '@mob/client/store';

export const selectAccount = createSelector(
  getEntities,
  (entities) => entities.account
);

export const selectCharacters = createSelector(
  getEntities,
  (entities) => entities.characters
    ? Object.values(entities.characters)
    : []
);

export const selectToken = createSelector(
  getEntities,
  (entities) => entities.token
);
