import { Client, Room } from 'colyseus.js';
import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect
} from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { useLocalStateReducer } from '@bao/client/hooks';
import { selectToken } from '@bao/client/queries/account';
import { State } from '@bao/client/store';

import { WorldRoomState } from '@bao/server/schema/WorldRoomState';

export interface GameConnectedProps {
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
  connected: false
});

export const createWorldOptions = (): GameContainerOptions => ({
  room: 'world'
});

export const GameContext = createContext<Partial<GameContextProps>>({});
export const useGame = () => {
  return useContext(GameContext);
};

export const GameContainer = <P extends GameConnectedProps>(
  Component: React.ComponentType<P>,
  options: GameContainerOptions = createWorldOptions()
) => {
  const WithGameContext: React.FC<GameConnectedProps> = (props) => {
    const { token } = props;
    const router = useRouter();
    const [state, setState, resetState] =
      useLocalStateReducer<GameContextState>(createInitialState());

    const handleSendRoomMessage = useCallback(
      (messageType, parameters) => {
        if (state.room) {
          return state.room.send(messageType, parameters);
        }

        console.warn(
          `[handleSendRoomMessage]: Sending message to closed room ${messageType}:${JSON.stringify(
            parameters,
            Object.getOwnPropertyNames(parameters),
            2
          )}`
        );
      },
      [state]
    );

    const handleLeaveRoom = useCallback(() => {
      if (state.room) {
        resetState();
        state.room.leave(true);
        router.push('/');
        return;
      }

      console.warn(`[handleLeaveRoom]: trying to leave a closed room`);
    }, [router, resetState, state]);

    const handleRoomError = useCallback(
      (error: any) => {
        if (error.message === 'LEAVE_ROOM') {
          resetState();
          router.push('/');
          return;
        }

        console.warn(
          `[handleRoomError]: unhandled room error ${JSON.stringify(
            error,
            Object.getOwnPropertyNames(error),
            2
          )}`
        );
      },
      [router, resetState]
    );

    const handleRoomMessage = useCallback((type: any, message: any) => {
      console.log(type, message);
    }, []);

    const handleUpdateServerState = useCallback(
      (serverState: WorldRoomState) => {
        setState({ serverState });
      },
      [setState]
    );

    const handleJoinRoom = useCallback(async () => {
      try {
        const client = new Client(process.env.NEXT_PUBLIC_BAO_SERVER);
        const room = await client.joinOrCreate<WorldRoomState>(options.room, {
          characterId: router.query.characterId,
          token
        });

        room.onMessage('*', handleRoomMessage);
        room.onStateChange(handleUpdateServerState);
        room.onError(handleRoomError);
        room.onLeave(() => handleRoomError({ message: 'LEAVE_ROOM' }));

        setState({
          connected: true,
          client,
          room
        });
      } catch (error) {
        console.error(
          `[handleJoinRoom]: Error ${JSON.stringify(
            error,
            Object.getOwnPropertyNames(error),
            2
          )}`
        );

        return router.push('/');
      }
    }, [
      handleRoomError,
      handleRoomMessage,
      handleUpdateServerState,
      setState,
      token
    ]);

    useEffect(() => {
      handleJoinRoom();
      return handleLeaveRoom;
    }, []);

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
        <Component {...(props as P)} />
      </GameContext.Provider>
    );
  };

  const mapStateToProps = (state: State) => ({
    token: selectToken(state)
  });

  return compose(connect(mapStateToProps))(WithGameContext);
};

export const withGameContextOptions =
  <P extends GameConnectedProps>(options: GameContainerOptions) =>
  (Component: React.ComponentType<P>) =>
    GameContainer(Component, options);

export const withGameContext = GameContainer;
