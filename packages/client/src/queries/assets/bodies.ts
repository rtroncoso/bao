import { QueryConfig } from 'redux-query';

import { override } from '@mob/client/queries/shared';
import { getJsonBodies, JsonBodiesModel } from '@mob/core/loaders';
import { AssetEntities, BodiesEntityModel, LoadBodiesPayload } from './models';

export const loadBodiesQuery = {
  force: true,
  options: {
    method: 'GET',
  },
  queryKey: 'loadBodies:GET',
};

export const transformBodiesResponse = (response: JsonBodiesModel) => {
  // const bodies = getJsonBodies(response, animations) as BodiesEntityModel;
  return {
    // bodies
  };
};

export const loadBodies = ({
  manifest,
  graphics
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
