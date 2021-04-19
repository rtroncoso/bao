import { QueryConfig } from 'redux-query';

import { override } from '@mob/client/queries/shared';
import { getJsonGraphics, JsonGraphicsModel } from '@mob/core/loaders';
import { AssetEntities, LoadGraphicsPayload } from './models';

export const loadGraphicsQuery = {
  force: true,
  options: {
    method: 'GET',
  },
  queryKey: 'loadGraphics:GET',
};

export const transformGraphicsResponse = (response: JsonGraphicsModel) => {
  const graphics = getJsonGraphics(response);
  return {
    graphics
  };
};

export const loadGraphics = ({
  manifest,
}: LoadGraphicsPayload): QueryConfig<AssetEntities> => {
  return {
    ...loadGraphicsQuery,
    url: `${process.env.MOB_ASSETS}/${manifest.init.graphics}`,
    transform: transformGraphicsResponse,
    update: {
      graphics: override,
    },
  };
};
