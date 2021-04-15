import { QueryConfig } from 'redux-query';

import { override } from '@mob/client/queries/shared';
import { JsonBodiesModel } from '@mob/core/loaders';
import { AssetEntities, LoadBodiesPayload } from './models';

export const loadBodiesQuery = {
  force: true,
  options: {
    method: 'GET',
  },
  queryKey: 'loadBodies:GET',
};

export const transformBodiesResponse = (bodies: JsonBodiesModel) => {
  return {
    bodies
  };
};

export const loadBodies = ({
  manifest,
}: LoadBodiesPayload): QueryConfig<AssetEntities> => {
  return {
    ...loadBodiesQuery,
    url: `${process.env.MOB_ASSETS}/${manifest.init.bodies}`,
    transform: transformBodiesResponse,
    update: {
      bodies: override,
    },
  };
};
