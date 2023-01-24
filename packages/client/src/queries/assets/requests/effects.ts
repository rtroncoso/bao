import { QueryConfig } from 'redux-query';

import { override } from '@bao/client/queries/shared';
import { getJsonEffects, JsonEffectsModel } from '@bao/core/loaders';
import { AssetEntities, LoadResourcePayload } from '../asset.model';

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
    url: `${process.env.NEXT_PUBLIC_BAO_ASSETS}/${manifest.init.effects}`,
    transform: transformEffectsResponse({ animations, graphics }),
    update: {
      effects: override
    }
  };
};
