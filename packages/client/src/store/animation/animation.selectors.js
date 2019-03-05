import { createSelector } from 'reselect';
import _ from 'lodash';

export const animationState = state => state.Animation;

export const selectEntities = createSelector(
  animationState,
  state => _.get(state, 'entities', []),
);
