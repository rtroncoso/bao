import { QueryConfig } from 'redux-query';

import { override } from '@bao/client/queries/shared';
import { getJsonHelmets, JsonHelmetsModel } from '@bao/core/loaders';
import { AssetEntities, LoadResourcePayload } from '../asset.model';

export const loadHelmetsQuery = {
  force: true,
  options: {
    method: 'GET'
  },
  queryKey: 'loadHelmets:GET'
};

export const transformHelmetsResponse =
  (payload: Partial<LoadResourcePayload>) => (data: JsonHelmetsModel) => {
    const helmets = getJsonHelmets(data, payload.graphics);

    return {
      helmets
    };
  };

export const loadHelmets = ({
  animations,
  manifest,
  graphics
}: LoadResourcePayload): QueryConfig<AssetEntities> => {
  return {
    ...loadHelmetsQuery,
    url: `${process.env.NEXT_PUBLIC_BAO_ASSETS}/${manifest.init.helmets}`,
    transform: transformHelmetsResponse({ animations, graphics }),
    update: {
      helmets: override
    }
  };
};
