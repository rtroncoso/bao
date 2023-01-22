import { createSelector } from 'reselect';

import { getEntities } from '@bao/client/queries';

export const selectAccount = createSelector(
  getEntities,
  (entities) => entities.account
);

export const selectCharacters = createSelector(getEntities, (entities) =>
  entities.characters ? Object.values(entities.characters) : []
);

export const selectToken = createSelector(getEntities, (entities) =>
  entities.account ? entities.account.token : null
);

export const selectCurrentCharacter = createSelector(
  selectAccount,
  selectCharacters,
  (account, characters) =>
    Object.prototype.hasOwnProperty.call(
      characters,
      account?.currentCharacterId as number
    )
      ? characters[account?.currentCharacterId as number]
      : null
);
