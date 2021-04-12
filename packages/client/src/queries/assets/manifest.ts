import { QueryConfig } from 'redux-query';

import { merge } from '@mob/client/queries/shared';
import { AssetEntities, LoadManifestParameters, ManifestModel } from './models';

export const loadManifestQuery = {
  cache: false,
  force: true,
  options: {
    cache: false,
    method: 'GET',
  },
  queryKey: 'loadManifest:GET',
  url: `${process.env.MOB_ASSETS}/manifest.json`,
};

export const transformManifestResponse = (manifest: ManifestModel) => {
  return {
    manifest
  };
};

export const loadManifest = ({
  token
}: LoadManifestParameters): QueryConfig<AssetEntities> => {
  console.log(token);
  return {
    ...loadManifestQuery,
    transform: transformManifestResponse,
    update: {
      manifest: merge,
    },
  };
};
