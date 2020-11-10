import { applyMiddleware, createStore, combineReducers } from 'redux';
import {
  entitiesReducer,
  EntitiesState,
  queriesReducer,
  QueriesState,
  queryMiddleware
} from 'redux-query';
import superagentInterface from 'redux-query-interface-superagent';

export interface State {
  entities: EntitiesState,
  queries: QueriesState
}

export const getQueries = (state: State) => state.queries;
export const getEntities = (state: State) => state.entities;

const reducer = combineReducers({
  entities: entitiesReducer,
  queries: queriesReducer,
});

const store = createStore(
  reducer,
  applyMiddleware(
    queryMiddleware(superagentInterface, getQueries, getEntities)
  )
);

export default store;
