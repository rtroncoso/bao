import { createSelector } from 'reselect';

export const selectAppState = state => state.App;

export const selectFilterColor = createSelector(
  selectAppState,
  state => state.color
);

export const selectFilterEnabled = createSelector(
  selectAppState,
  state => state.enabled
);

export default null;
