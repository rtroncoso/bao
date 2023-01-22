import { QueryConfig } from 'redux-query';

import { override } from '@bao/client/queries/shared';
import { getJsonShields, JsonShieldsModel } from '@bao/core/loaders';
import { AssetEntities, LoadResourcePayload } from '../models';

export const loadShieldsQuery = {
  force: true,
  options: {
    method: 'GET'
  },
  queryKey: 'loadShields:GET'
};

export const transformShieldsResponse =
  (payload: Partial<LoadResourcePayload>) => (data: JsonShieldsModel) => {
    const shields = getJsonShields(data, payload.animations);

    return {
      shields
    };
  };

export const loadShields = ({
  animations,
  manifest,
  graphics
}: LoadResourcePayload): QueryConfig<AssetEntities> => {
  return {
    ...loadShieldsQuery,
    url: `${process.env.NEXT_PUBLIC_BAO_ASSETS}/${manifest.init.shields}`,
    transform: transformShieldsResponse({ animations, graphics }),
    update: {
      shields: override
    }
  };
};
