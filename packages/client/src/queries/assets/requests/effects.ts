import { QueryConfig } from 'redux-query';

import { override } from '@mob/client/queries/shared';
import { getJsonEffects, JsonEffectsModel } from '@mob/core/loaders';
import { AssetEntities, LoadResourcePayload } from '../models';

export const loadEffectsQuery = {
  force: true,
  options: {
    method: 'GET'
  },
  queryKey: 'loadEffects:GET'
};

export const transformEffectsResponse =
  (payload: Partial<LoadResourcePayload>) => (data: JsonEffectsModel) => {
    const effects = getJsonEffects(data, payload.animations);

    return {
      effects
    };
  };

export const loadEffects = ({
  animations,
  manifest,
  graphics
}: LoadResourcePayload): QueryConfig<AssetEntities> => {
  return {
    ...loadEffectsQuery,
    url: `${process.env.NEXT_PUBLIC_MOB_ASSETS}/${manifest.init.effects}`,
    transform: transformEffectsResponse({ animations, graphics }),
    update: {
      effects: override
    }
  };
};
