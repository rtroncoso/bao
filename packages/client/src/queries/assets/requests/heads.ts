import { QueryConfig } from 'redux-query';

import { override } from '@bao/client/queries/shared';
import { getJsonHeads, JsonHeadsModel } from '@bao/core/loaders';
import { AssetEntities, LoadResourcePayload } from '../asset.model';

export const loadHeadsQuery = {
  force: true,
  options: {
    method: 'GET'
  },
  queryKey: 'loadHeads:GET'
};

export const transformHeadsResponse =
  (payload: Partial<LoadResourcePayload>) => (data: JsonHeadsModel) => {
    const heads = getJsonHeads(data, payload.graphics);

    return {
      heads
    };
  };

export const loadHeads = ({
  animations,
  manifest,
  graphics
}: LoadResourcePayload): QueryConfig<AssetEntities> => {
  return {
    ...loadHeadsQuery,
    url: `${process.env.NEXT_PUBLIC_BAO_ASSETS}/${manifest.init.heads}`,
    transform: transformHeadsResponse({ animations, graphics }),
    update: {
      heads: override
    }
  };
};
