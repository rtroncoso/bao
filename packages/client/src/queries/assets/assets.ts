import { QueryConfig } from 'redux-query';
import { merge } from '@mob/client/queries/shared';

export const loginQuery = {
  cache: true,
  options: {
    method: 'GET'
  },
  url: `${process.env.MOB_ASSETS}/manifest.json`,
};

export const transformManifestResponse = (responseBody: any) => {
  return {
  }
};

const manifest = (): QueryConfig<any> => {
  return {
    ...loginQuery,
    transform: transformManifestResponse,
    update: {
      account: merge,
      characters: merge
    },
  }
};

export default manifest;
