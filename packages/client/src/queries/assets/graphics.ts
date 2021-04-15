import { QueryConfig } from 'redux-query';

import { override } from '@mob/client/queries/shared';
import { JsonGraphicsModel } from '@mob/core/loaders';
import { AssetEntities, LoadGraphicsPayload } from './models';

export const loadGraphicsQuery = {
  force: true,
  options: {
    method: 'GET',
  },
  queryKey: 'loadGraphics:GET',
};

export const transformGraphicsResponse = (graphics: JsonGraphicsModel) => {
  return {
    graphics
  };
};

export const loadGraphics = ({
  manifest,
}: LoadGraphicsPayload): QueryConfig<AssetEntities> => {
  return {
    ...loadGraphicsQuery,
    url: `${manifest.init.graphics}`,
    transform: transformGraphicsResponse,
    update: {
      graphics: override,
    },
  };
};
