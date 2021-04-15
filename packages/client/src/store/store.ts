import { createSelectorHook, useDispatch } from 'react-redux';
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
import createSagaMiddleware from 'redux-saga';

import { AccountEntities } from '@mob/client/queries/account/models';
import { AssetEntities } from '@mob/client/queries/assets/models';

export type EntitiesState =
  & AccountEntities
  & AssetEntities;

export interface State {
  entities: EntitiesState,
  errors: ErrorsState,
  queries: QueriesState,
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

export const sagaMiddleware = createSagaMiddleware();
const persistedReducer = persistReducer(persistConfig, reducer);
const enhancers = composeWithDevTools(
  applyMiddleware(
    sagaMiddleware,
    queryMiddleware(superagentInterface, getQueries, getEntities),
  )
);

export const store = createStore(
  persistedReducer,
  enhancers
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = createSelectorHook<RootState>();

export const persistor = persistStore(store);
