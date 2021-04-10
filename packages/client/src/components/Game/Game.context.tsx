import { Schema } from '@colyseus/schema';
import { Client, Room } from 'colyseus.js';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect
} from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { compose } from 'redux';

import { useLocalStateReducer } from '@mob/client/hooks';
import { selectToken } from '@mob/client/queries/account';
import { State } from '@mob/client/store';

import { WorldRoomState } from '@mob/server/schema/WorldRoomState';

export interface ConnectedProps {
  token?: string | null;
}

export interface GameContainerOptions {
  room: string;
}

export interface GameComponentRouterState {
  characterId?: number;
}

export interface GameContextState {
  client?: Client;
  connected: boolean;
  serverState?: WorldRoomState;
  room?: Room<WorldRoomState>;
}

export interface GameContextProps {
  callbacks: any;
  state: GameContextState;
}

export const createInitialState = (): GameContextState => ({
  connected: false,
})

export const createWorldOptions = (): GameContainerOptions => ({
  room: 'world',
});

export const GameContext = createContext<Partial<GameContextProps>>({});
export const useGame = () => {
  return useContext(GameContext);
};

export const GameContainer = <P extends ConnectedProps>(
  Component: React.ComponentType<P>,
  options: GameContainerOptions = createWorldOptions()
) => {
  const WithGameContext: React.FC<ConnectedProps> = (props) => {
    const { token } = props;
    const history = useHistory();
    const location = useLocation<GameComponentRouterState>();
    const [state, setState, resetState] = useLocalStateReducer<GameContextState>(createInitialState());

    const handleSendRoomMessage = useCallback((messageType, parameters) => {
      if (state.room) {
        return state.room.send(messageType, parameters)
      }

      console.warn(`[handleSendRoomMessage]: Sending message to closed room ${messageType}:${JSON.stringify(parameters, null, 2)}`);
    }, [state]);

    const handleLeaveRoom = useCallback(() => {
      if (state.room) {
        resetState();
        state.room.leave(true);
        return history.push('/');
      }

      console.warn(`[handleLeaveRoom]: trying to leave a closed room`);
    }, [history, resetState, state]);

    const handleRoomError = useCallback((error: any) => {
      if (error.message === 'LEAVE_ROOM') {
        resetState();
        return history.push('/');
      }

      console.warn(`[handleRoomError]: unhandled room error ${JSON.stringify(error, null, 2)}`)
    }, [history, resetState]);

    const handleRoomMessage = useCallback((type: string | number | Schema, message: any) => {
      console.log(type, message);
    }, []);

    const handleUpdateserverState = useCallback((serverState: WorldRoomState) => {
      setState({ serverState });
    }, [setState]);

    const handleJoinRoom = useCallback(async () => {
      try {
        const client = new Client(process.env.MOB_SERVER);
        const room = await client.joinOrCreate<WorldRoomState>(options.room, {
          characterId: location.state.characterId,
          token,
        });

        room.onMessage('*', handleRoomMessage);
        room.onStateChange(handleUpdateserverState);
        room.onError(handleRoomError);
        room.onLeave(() => handleRoomError({ message: 'LEAVE_ROOM' }));

        setState({
          connected: true,
          client,
          room
        });
      } catch(error) {
        console.error(`[handleJoinRoom]: Error ${JSON.stringify(error, null, 2)}`);
      }
    }, [handleRoomError, handleUpdateserverState, location, setState, token]);

    useEffect(() => {
      handleJoinRoom();
      return handleLeaveRoom;
    }, []); // eslint-disable-line

    const callbacks = {
      handleJoinRoom,
      handleLeaveRoom,
      handleSendRoomMessage
    };

    return (
      <GameContext.Provider
        value={{
          callbacks,
          state
        }}
      >
        <Component {...props as P} />
      </GameContext.Provider>
    );
  };

  const mapStateToProps = (state: State) => ({
    token: selectToken(state)
  });

  return compose(
    connect(mapStateToProps)
  )(WithGameContext);
};

export const withGameContextOptions = <P extends ConnectedProps>(
  options: GameContainerOptions
) => (
  Component: React.ComponentType<P>
) => GameContainer(Component, options);

export const withGameContext = GameContainer;
