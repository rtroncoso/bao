import { createAction } from 'redux-actions';
import { createReducers } from 'redux-arc';

export const START_GAME = 'mob/game/START_GAME';

export const startGame = createAction(START_GAME);

export const defaultState = {
};

export const HANDLERS = {
};

export default createReducers(defaultState, HANDLERS);
