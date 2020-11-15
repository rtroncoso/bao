import { applyMiddleware, createStore, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  entitiesReducer,
  errorsReducer,
  ErrorsState,
  queriesReducer,
  QueriesState,
  queryMiddleware
} from 'redux-query';
import superagentInterface from 'redux-query-interface-superagent';

import { LoginEntities } from '@/queries/account';

export type EntitiesState =
  LoginEntities;
export interface State {
  entities: EntitiesState,
  errors: ErrorsState,
  queries: QueriesState
}

export const getEntities = (state: State) => state.entities;
export const getErrors = (state: State) => state.errors;
export const getQueries = (state: State) => state.queries;

const reducer = combineReducers({
  entities: entitiesReducer,
  errors: errorsReducer,
  queries: queriesReducer,
});

const store = createStore(
  reducer,
  composeWithDevTools(
    applyMiddleware(
      queryMiddleware(superagentInterface, getQueries, getEntities)
    )
  )
);

export default store;
