import { ResponseBody } from 'redux-query';
import { getErrors, getQueries, State } from '@mob/client/store';

export const selectErrors = (state: State, url: string, method = 'GET') => {
  const errors = getErrors(state);

  return Object.entries(errors).reduce<ResponseBody | null>((acc, entry) => {
    const [key, value] = entry;
    const { url: matchedUrl } = JSON.parse(key);
    if (url === matchedUrl) {
      acc = value.responseBody;
      return acc;
    }

    return acc;
  }, null);
};

export const selectIsLoading = (state: State, url: string, method = 'GET') => {
  const queries = getQueries(state);
  return Object.entries(queries).reduce<boolean>((acc, entry) => {
    const [key, value] = entry;
    const { url: matchedUrl } = JSON.parse(key);
    if (url === matchedUrl && value.isPending && !value.isFinished) {
      acc = true;
      return acc;
    }

    return acc;
  }, false);
};
