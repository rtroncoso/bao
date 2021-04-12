import { QueryConfig } from 'redux-query';

import { override } from '@mob/client/queries/shared';
import { AssetEntities, LoadBodiesParameters, BodiesModel } from './models';

export const loadBodiesQuery = {
  force: true,
  options: {
    method: 'GET',
  },
  queryKey: 'loadBodies:GET',
};

export const transformBodiesResponse = (bodies: BodiesModel) => {
  return {
    bodies
  };
};

export const loadBodies = ({
  manifest,
}: LoadBodiesParameters): QueryConfig<AssetEntities> => {
  return {
    ...loadBodiesQuery,
    url: `${process.env.MOB_ASSETS}/${manifest.init.bodies}`,
    transform: transformBodiesResponse,
    update: {
      bodies: override,
    },
  };
};
