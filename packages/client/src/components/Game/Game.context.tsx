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
  debug?: boolean;
  client?: Client;
  characterId?: string;
  connected?: boolean;
  serverState?: WorldRoomState;
  room?: Room<WorldRoomState>;
}

export interface GameContextProps {
  callbacks: {
    joinRoom: () => Promise<boolean>;
    leaveRoom: (error?: Error) => void;
    updateGameState: (updater: (draft: GameContextState) => void) => void;
    sendRoomMessage: (messageType: any, parameters: any) => void;
  };
  state: GameContextState;
}

export const createGameInitialState = (): GameContextState => ({
  connected: false
});

export const createWorldOptions = (): GameContainerOptions => ({
  room: 'world'
});

export const GameContext = createContext<Partial<GameContextProps>>({});

export const useGameContext = () => {
  return useContext(GameContext);
};

export const GameContainer = <P extends GameConnectedProps>(
  Component: React.ComponentType<P>,
  options: GameContainerOptions = createWorldOptions()
) => {
  const WithGameContext: React.FC<GameConnectedProps> = (props) => {
    if (typeof window === 'undefined') return null;
    const { token } = props;
    const router = useRouter();
    const [state, setState, resetState, updateState] =
      useLocalStateReducer<GameContextState>(createGameInitialState());

    useEffect(() => {
      if (!router.query?.characterId) {
        router.push('/characters');
      }

      setState({ characterId: router.query?.characterId as string });
      router.replace({ pathname: router.pathname, query: null }, undefined, {
        shallow: true
      });
    }, []);

    const handleSendRoomMessage = useCallback(
      (messageType, parameters) => {
        if (state.room) {
          return state.room.send(messageType, parameters);
        }

        console.warn(
          `[world:handleSendRoomMessage]: Sending message to closed room ${messageType}:${JSON.stringify(
            parameters,
            Object.getOwnPropertyNames(parameters),
            2
          )}`
        );
      },
      [state]
    );

    const handleLeaveRoom = useCallback(
      (error?: Error) => {
        if (error) {
          console.error(
            `[world:handleLeaveRoom]: exiting room with error "${error?.message}"`
          );
        }

        if (state.room) {
          state.room.leave(true);
          router.push('/');
          return;
        }

        console.warn(`[world:handleLeaveRoom]: trying to leave a closed room`);
      },
      [router, resetState, state]
    );

    const handleRoomError = useCallback(
      (error: any) => {
        if (error?.message === 'LEAVE_ROOM') {
          router.push('/');
          return;
        }

        console.warn(
          `[world:handleRoomError]: unhandled room error ${JSON.stringify(
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

    const handleSetServerState = useCallback(
      (serverState: WorldRoomState) => {
        setState({ serverState });
      },
      [setState]
    );

    const handleUpdateGameState = useCallback(
      (updater: Parameters<typeof updateState>[0]) => {
        updateState(updater);
      },
      [setState]
    );

    const handleJoinRoom = useCallback(async () => {
      try {
        const client = new Client(process.env.NEXT_PUBLIC_BAO_SERVER);
        const room = await client.joinOrCreate<WorldRoomState>(options.room, {
          characterId: state.characterId,
          token
        });

        room.onMessage('*', handleRoomMessage);
        room.onStateChange(handleSetServerState);
        room.onError(handleRoomError);
        room.onLeave(() => handleRoomError({ message: 'LEAVE_ROOM' }));

        setState({
          connected: true,
          client,
          room
        });
      } catch (error) {
        console.error(
          `[world:handleJoinRoom]: Error ${JSON.stringify(
            error,
            Object.getOwnPropertyNames(error),
            2
          )}`
        );

        return router.push('/');
      }
    }, [
      state,
      handleRoomError,
      handleRoomMessage,
      handleSetServerState,
      setState,
      token
    ]);

    useEffect(() => {
      if (state.characterId) {
        handleJoinRoom();
      }

      return handleLeaveRoom;
    }, [state.characterId]);

    const callbacks = {
      joinRoom: handleJoinRoom,
      leaveRoom: handleLeaveRoom,
      updateGameState: handleUpdateGameState,
      sendRoomMessage: handleSendRoomMessage
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
