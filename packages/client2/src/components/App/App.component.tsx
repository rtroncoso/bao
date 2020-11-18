import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { CharacterSelectionContainer } from '@mob/client/components/CharacterSelection';
import { GameContainer } from '@mob/client/components/Game';
import { LoginContainer } from '@mob/client/components/Login';
import AppStyled from './App.styles';

export interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <AppStyled>
      <Switch>
        <Route exact path="/login" component={LoginContainer as React.FC} />
        <Route exact path="/characters" component={CharacterSelectionContainer as React.FC} />
        <Route exact path="/game" component={GameContainer as React.FC} />
        <Route exact path="**" render={() => (<Redirect to="/login" />)} />
      </Switch>
    </AppStyled>
  );
}

export default App;
