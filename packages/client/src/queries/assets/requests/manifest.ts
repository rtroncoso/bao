import { QueryConfig } from 'redux-query';

import { merge } from '@bao/client/queries/shared';
import {
  AssetEntities,
  LoadManifestPayload,
  ManifestModel
} from '../asset.model';

export const loadManifestQuery = {
  cache: false,
  force: true,
  options: {
    cache: false,
    method: 'GET'
  },
  queryKey: 'loadManifest:GET',
  url: `${process.env.NEXT_PUBLIC_BAO_ASSETS}/manifest.json`
};

export const transformManifestResponse = (manifest: ManifestModel) => {
  return {
    manifest
  };
};

export const loadManifest = ({
  token
}: LoadManifestPayload): QueryConfig<AssetEntities> => {
  return {
    ...loadManifestQuery,
    transform: transformManifestResponse,
    update: {
      manifest: merge
    }
  };
};
