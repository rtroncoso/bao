import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import {
  applyMiddleware, createStore, combineReducers, compose
} from 'redux';
import createSagaMiddleware from 'redux-saga';

import Animation from './animation/animation.state';
import App from './app/app.state';
import Asset from './asset/asset.state';
import Game from './game/game.state';
import Render from './render/render.state';
import rootSaga from './sagas';

// create the saga middleware
export const sagaMiddleware = createSagaMiddleware();

export const history = createBrowserHistory();

const reducer = combineReducers({
  router: connectRouter(history),
  Animation,
  App,
  Asset,
  Game,
  Render,
});

const devToolsEnhancer = typeof window === 'object' //! env.production &&
  && window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__({
    // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    actionsBlacklist: ['@@render/.*'],
  }) : compose;

const enhancers = compose(
  applyMiddleware(
    sagaMiddleware,
    routerMiddleware(history)
  ),
  devToolsEnhancer
);

export default createStore(reducer, enhancers);

// run saga engine
sagaMiddleware.run(rootSaga);
