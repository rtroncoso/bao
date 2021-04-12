import { ResponseBody } from 'redux-query';
import { getErrors, getQueries, State } from '@mob/client/store';

export const selectErrors = (state: State, queryKey: string) => {
  const errors = getErrors(state);

  return Object.entries(errors)
    .reduce<ResponseBody | null>((state, entry) => {
      const [key, value] = entry;

      if (queryKey === key) {
        state = value.responseBody;
        return state;
      }

      return state;
    }, null);
};

export const selectIsLoading = (state: State, queryKey: string) => {
  const queries = getQueries(state);
  return Object.entries(queries)
    .reduce<boolean>((state, entry) => {
      const [key, value] = entry;

      if (
        queryKey === key &&
        value.isPending && !value.isFinished
      ) {
        state = true;
        return state;
      }

      return state;
    }, false);
};

export const selectIsLoadingMany = (state: State, keys: string[]) => {
  return keys.some(key => (
    selectIsLoading(state, key)
  ));
};
