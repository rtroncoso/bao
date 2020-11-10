import React, { useCallback, useEffect, useState } from 'react';
import { querySelectors } from 'redux-query';

// import { GameContainer } from '@mob/client/components/Game';
import { Button } from '@mob/client/components/Button';
import { Input } from '@mob/client/components/Input';
import { loginQuery } from '@mob/client/queries/login';
import AppStyled from './App.styles';

interface AppProps {
  queries: any;
  login: Function;
}

const App = ({
  queries,
  login
}: AppProps) => {
  const [isLoading, setLoading] = useState(false);
  const [state, setState] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    if (state.username && state.password) {
      setLoading(querySelectors.isPending(queries, {
        ...loginQuery,
        body: {
          username: state.username,
          password: state.password
        }
      }));
    }
  }, [login, queries, state]);

  const performLogin = useCallback(() => {
    login({
      username: state.username,
      password: state.password
    });
  }, [login, state]);

  return (
    <AppStyled>
      {isLoading && (
        <div className="w-full h-full fixed block top-0 left-0 bg-white opacity-75 z-50">
          <span className="text-green-500 opacity-75 top-1/2 my-0 mx-auto block relative w-0 h-0" style={{ top: '50%' }}>
            <i className="fas fa-circle-notch fa-spin fa-5x"></i>
          </span>
        </div>
      )}
      <div className="bg-gray-100 rounded-sm w-1/3 h-auto p-4 shadow-outline flex flex-col items-center justify-center">
        <span className="pb-2 text-2xl text-indigo-800 text-center font-mono">Login</span>
        <Input
          type="text"
          name="username"
          placeholder="Usuario"
          value={state.username}
          onChange={(event) => setState({ ...state, username: event.target.value })}
        />
        <Input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={state.password}
          onChange={(event) => setState({ ...state, password: event.target.value })}
        />
        <Button
          type="submit"
          disabled={!state.username || !state.password}
          onClick={performLogin}
        >
          Ingresar
        </Button>
      </div>
    </AppStyled>
  );
}

export default App;
