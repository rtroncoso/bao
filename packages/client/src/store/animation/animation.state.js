import _ from 'lodash';
import { createAction } from 'redux-actions';
import { createReducers } from 'redux-arc';

export const UPDATE_ANIMATED_ENTITIES = 'mob/game/UPDATE_ANIMATED_ENTITIES';
export const updateAnimatedEntities = createAction(UPDATE_ANIMATED_ENTITIES);

export const defaultState = {
  entities: []
};

export const HANDLERS = {
  [UPDATE_ANIMATED_ENTITIES]: (state, action) => ({
    ...state,
    entities: _.merge(state.entities, _.get(action.payload, 'entities')),
  })
};

export default createReducers(defaultState, HANDLERS);
