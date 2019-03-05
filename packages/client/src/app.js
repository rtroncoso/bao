/**
 * app.js - The main entry point from WebPack
 */
import 'src/app.scss';
import Store from 'store/store';

import '@pixi/polyfill';
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import AppComponent from 'client/components/App/AppComponent';
import GameComponent from 'client/components/App/GameComponent';
import routes, {
  renderOutlet,
  GAME_OUTLET,
  OVERLAY_OUTLET
} from 'client/routes';

export function renderApp() {
  render(
    <Provider store={Store}>
      <React.Fragment>
        <GameComponent>
          { renderOutlet(routes, GAME_OUTLET) }
        </GameComponent>
        <AppComponent>
          { renderOutlet(routes, OVERLAY_OUTLET) }
        </AppComponent>
      </React.Fragment>
    </Provider>,
    document.getElementById('app')
  );
}

export default null;
