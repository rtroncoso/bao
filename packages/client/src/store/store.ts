import { createSelectorHook, useDispatch } from 'react-redux';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'localforage';
import {
  entitiesReducer,
  errorsReducer,
  queriesReducer,
  queryMiddleware
} from 'redux-query';
import superagentInterface from 'redux-query-interface-superagent';
import createSagaMiddleware from 'redux-saga';

import { getEntities, getQueries } from '@mob/client/queries';
import { querySagas } from '@mob/client/queries';

const reducer = combineReducers({
  entities: entitiesReducer,
  errors: errorsReducer,
  queries: queriesReducer
});

const persistConfig = {
  blacklist: [
    'entities.animations',
    'entities.graphics',
    'entities.manifest',
    'errors',
    'queries'
  ],
  key: 'root',
  storage
};

export const sagaMiddleware = createSagaMiddleware();
const persistedReducer = persistReducer<any>(persistConfig, reducer);
const enhancers = composeWithDevTools(
  applyMiddleware(
    sagaMiddleware,
    queryMiddleware(superagentInterface, getQueries, getEntities)
  )
);

export let store;
if (typeof window === undefined) {
  store = createStore(reducer, enhancers);
} else {
  store = createStore(persistedReducer, enhancers);
}

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector = createSelectorHook<State>();

export const persistor = persistStore(store);

sagaMiddleware.run(querySagas);
