import { QueryConfig } from 'redux-query';

import { override } from '@mob/client/queries/shared';
import { getJsonBodies, JsonBodiesModel } from '@mob/core/loaders';
import { AssetEntities, LoadBodiesPayload } from './models';

export const loadBodiesQuery = {
  force: true,
  options: {
    method: 'GET',
  },
  queryKey: 'loadBodies:GET',
};

export const transformBodiesResponse = (payload: Partial<LoadBodiesPayload>) => (
  (data: JsonBodiesModel) => {
    const bodies = getJsonBodies(data, payload.animations);

    return {
      bodies
    };
  }
);

export const loadBodies = ({
  animations,
  manifest,
  graphics
}: LoadBodiesPayload): QueryConfig<AssetEntities> => {
  return {
    ...loadBodiesQuery,
    url: `${process.env.MOB_ASSETS}/${manifest.init.bodies}`,
    transform: transformBodiesResponse({ animations, graphics }),
    update: {
      bodies: override,
    },
  };
};
