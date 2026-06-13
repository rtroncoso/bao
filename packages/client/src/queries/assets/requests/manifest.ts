import { getBaoAssetsBaseUrl } from '@bao/client/lib/baoUrls';
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
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    },
    method: 'GET'
  },
  queryKey: 'loadManifest:GET',
  url: `${getBaoAssetsBaseUrl()}/manifest.json`
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
