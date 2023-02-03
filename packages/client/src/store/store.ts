import { parse, stringify } from 'flatted';
import storage from 'localforage';
import { createSelectorHook, useDispatch } from 'react-redux';
import { applyMiddleware, createStore, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import {
  entitiesReducer,
  errorsReducer,
  queriesReducer,
  queryMiddleware
} from 'redux-query';
import superagentInterface from 'redux-query-interface-superagent';
import createSagaMiddleware from 'redux-saga';

import { getEntities, getQueries } from '@bao/client/queries';
import { querySagas } from '@bao/client/queries';

const reducer = combineReducers({
  entities: entitiesReducer,
  errors: errorsReducer,
  queries: queriesReducer
});

export const transformCircular = createTransform(
  (inboundState, key) => stringify(inboundState),
  (outboundState, key) => parse(outboundState)
);

const persistConfig = {
  storage,
  blacklist: [
    'entities.animations',
    'entities.graphics',
    'entities.manifest',
    'entities.bodies',
    'entities.effects',
    'entities.heads',
    'entities.helmets',
    'entities.shields',
    'entities.weapons',
    'errors',
    'queries'
  ],
  key: 'root',
  transforms: [transformCircular]
};

export let store;
if (typeof window === 'undefined') {
  store = createStore(reducer);
} else {
  const sagaMiddleware = createSagaMiddleware();
  const enhancers = applyMiddleware(
    sagaMiddleware,
    queryMiddleware(superagentInterface, getQueries, getEntities)
  );
  const persistedReducer = persistReducer<any>(persistConfig, reducer);
  store = createStore(persistedReducer, composeWithDevTools(enhancers));

  sagaMiddleware.run(querySagas);
}

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<Dispatch>();
export const useAppSelector = createSelectorHook<State>();

export const persistor = persistStore(store);
