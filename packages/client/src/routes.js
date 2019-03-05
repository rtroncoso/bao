import { ConnectedRouter } from 'connected-react-router';
import { history } from 'store/store';

import React from 'react';
import { Route, Switch } from 'react-router';

import Overlay from './components/App/Overlay/Overlay';
import Example from './components/Screens/Example/Example';
import Game from './components/Screens/Game/Game';
import Loader from './components/Screens/Loader/Loader';

export const HOME_PATH = '/';
export const GAME_PATH = '/game';
export const LOADER_PATH = '/loader';
export const EXAMPLE_PATH = '/example';

const OverlayWrapper = () => <Overlay />;
const GameScreen = () => <Game />;
const LoaderScreen = () => <Loader />;
const ExampleScreen = () => <Example />;

export const GAME_OUTLET = 'game';
export const OVERLAY_OUTLET = 'app';

export const renderOutlet = (routes, outlet) => (
  <ConnectedRouter history={history}>
    <Switch>
      { routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          exact={route.exact}
          component={route[outlet]}
        />
      )) }
    </Switch>
  </ConnectedRouter>
);

const routes = [
  { path: HOME_PATH,
    exact: true,
    app: OverlayWrapper
  },
  { path: LOADER_PATH,
    game: LoaderScreen,
    app: OverlayWrapper
  },
  { path: GAME_PATH,
    game: GameScreen,
    app: OverlayWrapper
  },
  { path: EXAMPLE_PATH,
    game: ExampleScreen,
    app: OverlayWrapper
  },
];

export default routes;
