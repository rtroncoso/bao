import { createAction } from 'redux-actions';
import { createReducers } from 'redux-arc';

export const FILTER_COLOR = 'mob/app/FILTER_COLOR';
export const FILTER_ON = 'mob/app/FILTER_ON';

export const updateFilterColor = createAction(FILTER_COLOR);
export const updateFilterIsOn = createAction(FILTER_ON);

export const defaultState = {
  color: '#9c0a3c',
  coloron: false
};

export const HANDLERS = {
  [FILTER_COLOR]: (state, action) => ({
    ...state,
    color: action.payload,
  }),
  [FILTER_ON]: (state, action) => ({ ...state, coloron: action.payload })
};

export default createReducers(defaultState, HANDLERS);
