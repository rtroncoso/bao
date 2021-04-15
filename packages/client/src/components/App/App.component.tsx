import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { CharacterSelectionContainer } from '@mob/client/components/CharacterSelection';
import { WorldRoomContainer } from '@mob/client/components/Game';
import { LoginContainer } from '@mob/client/components/Login';
import AppStyled from './App.styles';

export interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <AppStyled>
      <Switch>
        <Route exact path="/login" component={LoginContainer} />
        <Route exact path="/characters" component={CharacterSelectionContainer} />
        <Route exact path="/world" component={WorldRoomContainer} />
        <Route exact path="**" render={() => (<Redirect to="/login" />)} />
      </Switch>
    </AppStyled>
  );
}

export default App;
