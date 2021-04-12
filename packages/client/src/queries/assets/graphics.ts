import { QueryConfig } from 'redux-query';

import { override } from '@mob/client/queries/shared';
import { AssetEntities, LoadGraphicsParameters, GraphicsModel } from './models';

export const loadGraphicsQuery = {
  force: true,
  options: {
    method: 'GET',
  },
  queryKey: 'loadGraphics:GET',
};

export const transformGraphicsResponse = (graphics: GraphicsModel) => {
  return {
    graphics
  };
};

export const loadGraphics = ({
  manifest,
}: LoadGraphicsParameters): QueryConfig<AssetEntities> => {
  return {
    ...loadGraphicsQuery,
    url: `${process.env.MOB_ASSETS}/${manifest.init.graphics}`,
    transform: transformGraphicsResponse,
    update: {
      graphics: override,
    },
  };
};
