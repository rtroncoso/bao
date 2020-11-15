import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { LoginContainer } from '@mob/client/components/Login';
import { CharacterSelectionContainer } from '@mob/client/components/CharacterSelection';
import AppStyled from './App.styles';

export interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <AppStyled>
      <Switch>
        <Route exact path="/" render={() => (<Redirect to="/login" />)} />
        <Route exact path="/login" component={LoginContainer as React.FC} />
        <Route exact path="/characterSelection" component={CharacterSelectionContainer as React.FC} />
      </Switch>
    </AppStyled>
  );
}

export default App;
