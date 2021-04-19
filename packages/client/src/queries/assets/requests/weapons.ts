import { QueryConfig } from 'redux-query';

import { override } from '@mob/client/queries/shared';
import { getJsonWeapons, JsonWeaponsModel } from '@mob/core/loaders';
import { AssetEntities, LoadResourcePayload } from '../models';

export const loadWeaponsQuery = {
  force: true,
  options: {
    method: 'GET',
  },
  queryKey: 'loadWeapons:GET',
};

export const transformWeaponsResponse = (payload: Partial<LoadResourcePayload>) => (
  (data: JsonWeaponsModel) => {
    const weapons = getJsonWeapons(data, payload.animations);

    return {
      weapons
    };
  }
);

export const loadWeapons = ({
  animations,
  manifest,
  graphics
}: LoadResourcePayload): QueryConfig<AssetEntities> => {
  return {
    ...loadWeaponsQuery,
    url: `${process.env.MOB_ASSETS}/${manifest.init.weapons}`,
    transform: transformWeaponsResponse({ animations, graphics }),
    update: {
      weapons: override,
    },
  };
};
