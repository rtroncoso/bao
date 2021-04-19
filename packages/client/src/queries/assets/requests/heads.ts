import { QueryConfig } from 'redux-query';

import { override } from '@mob/client/queries/shared';
import { getJsonHeads, JsonHeadsModel } from '@mob/core/loaders';
import { AssetEntities, LoadResourcePayload } from '../models';

export const loadHeadsQuery = {
  force: true,
  options: {
    method: 'GET',
  },
  queryKey: 'loadHeads:GET',
};

export const transformHeadsResponse = (payload: Partial<LoadResourcePayload>) => (
  (data: JsonHeadsModel) => {
    const heads = getJsonHeads(data, payload.graphics);

    return {
      heads
    };
  }
);

export const loadHeads = ({
  animations,
  manifest,
  graphics
}: LoadResourcePayload): QueryConfig<AssetEntities> => {
  return {
    ...loadHeadsQuery,
    url: `${process.env.MOB_ASSETS}/${manifest.init.heads}`,
    transform: transformHeadsResponse({ animations, graphics }),
    update: {
      heads: override,
    },
  };
};
