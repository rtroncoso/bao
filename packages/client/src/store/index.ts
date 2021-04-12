import { applyMiddleware, createStore, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
  entitiesReducer,
  errorsReducer,
  ErrorsState,
  queriesReducer,
  QueriesState,
  queryMiddleware
} from 'redux-query';
import superagentInterface from 'redux-query-interface-superagent';
import thunk from 'redux-thunk';

import { AccountEntities } from '@mob/client/queries/account';
import { AssetEntities } from '@mob/client/queries/assets';

export type EntitiesState =
  & AccountEntities
  & AssetEntities
;

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

const persistConfig = {
  blacklist: ['errors', 'queries'],
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducer);
export const store = createStore(
  persistedReducer,
  composeWithDevTools(
    applyMiddleware(
      thunk,
      queryMiddleware(superagentInterface, getQueries, getEntities),
    )
  )
);

export const persistor = persistStore(store);
