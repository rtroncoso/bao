import { Client, Room } from 'colyseus.js';
import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { useLocalStateReducer } from '@bao/client/hooks';
import { selectToken } from '@bao/client/queries/account';
import { State } from '@bao/client/store';

import { WorldRoomState } from '@bao/server/schema/WorldRoomState';
import { createBaoClient } from '@bao/client/lib/colyseusClient';
import {
  formatColyseusConnectError,
  getBaoServerUrl
} from '@bao/client/lib/baoUrls';
import {
  clearGameRoomRefs,
  gameCharacterIdRef,
  gameRoomRef,
  gameServerStateRef,
  notifyGamePatch,
  syncLocalCharacterFromPatch
} from '@bao/client/lib/game-server-state';
import { rebuildCharacterIndex } from '@bao/client/lib/character-index';

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
    const joiningRef = useRef(false);

    useEffect(() => {
      if (!router.query?.characterId) {
        router.push('/characters');
      }

      setState({ characterId: router.query?.characterId as string });
      router.replace({ pathname: router.pathname, query: null }, undefined, {
        shallow: true
      });
    }, []);

    const characterIdRef = useRef(state.characterId);
    characterIdRef.current = state.characterId;
    gameCharacterIdRef.current = state.characterId;

    useEffect(() => {
      gameCharacterIdRef.current = state.characterId;
    }, [state.characterId]);

    const roomRef = useRef(state.room);
    roomRef.current = state.room;

    const handleSendRoomMessage = useCallback((messageType, parameters) => {
      const room = roomRef.current;
      if (room) {
        return room.send(messageType, parameters);
      }

      console.warn(
        `[world:handleSendRoomMessage]: Sending message to closed room ${messageType}:${JSON.stringify(
          parameters,
          Object.getOwnPropertyNames(parameters),
          2
        )}`
      );
    }, []);

    const handleLeaveRoom = useCallback(
      (error?: Error) => {
        if (error) {
          console.error(
            `[world:handleLeaveRoom]: exiting room with error "${error?.message}"`
          );
        }

        const room = roomRef.current;
        if (room) {
          room.leave(true);
          roomRef.current = undefined;
          clearGameRoomRefs();
          router.push('/');
          return;
        }

        console.warn(`[world:handleLeaveRoom]: trying to leave a closed room`);
      },
      [router]
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

    const handleSetServerState = useCallback((serverState: WorldRoomState) => {
      gameServerStateRef.current = serverState;
      syncLocalCharacterFromPatch();
      notifyGamePatch();
    }, []);

    const handleUpdateGameState = useCallback(
      (updater: Parameters<typeof updateState>[0]) => {
        updateState(updater);
      },
      [setState]
    );

    const handleJoinRoom = useCallback(async () => {
      if (!token || !state.characterId || joiningRef.current || state.room) {
        return false;
      }

      joiningRef.current = true;

      const serverUrl = getBaoServerUrl();

      try {
        const client = createBaoClient();
        const room = await client.joinOrCreate<WorldRoomState>(options.room, {
          characterId: state.characterId,
          token
        });

        room.onMessage('*', handleRoomMessage);
        room.onStateChange(handleSetServerState);
        room.onError(handleRoomError);
        room.onLeave(() => handleRoomError({ message: 'LEAVE_ROOM' }));

        gameRoomRef.current = room;
        gameServerStateRef.current = room.state;
        rebuildCharacterIndex(room.state.characters);
        syncLocalCharacterFromPatch();

        setState({
          connected: true,
          client,
          room,
          serverState: room.state
        });

        return true;
      } catch (error: unknown) {
        const message = formatColyseusConnectError(error, serverUrl);
        const matchMake = error as { code?: number };
        console.error(
          `[world:handleJoinRoom]: code=${
            matchMake?.code ?? 'n/a'
          } message=${message}`,
          error
        );

        router.push('/');
        return false;
      } finally {
        joiningRef.current = false;
      }
    }, [
      state.characterId,
      state.room,
      handleRoomError,
      handleRoomMessage,
      handleSetServerState,
      router,
      setState,
      token
    ]);

    useEffect(() => {
      if (state.characterId && token) {
        handleJoinRoom();
      }

      return () => {
        const room = roomRef.current;
        if (room) {
          room.leave(true);
          roomRef.current = undefined;
          clearGameRoomRefs();
        }
      };
    }, [state.characterId, token]);

    useEffect(() => {
      const handlePageHide = () => {
        roomRef.current?.leave(true);
      };

      window.addEventListener('pagehide', handlePageHide);
      return () => window.removeEventListener('pagehide', handlePageHide);
    }, []);

    const callbacks = useMemo(
      () => ({
        joinRoom: handleJoinRoom,
        leaveRoom: handleLeaveRoom,
        updateGameState: handleUpdateGameState,
        sendRoomMessage: handleSendRoomMessage
      }),
      [
        handleJoinRoom,
        handleLeaveRoom,
        handleUpdateGameState,
        handleSendRoomMessage
      ]
    );

    const contextValue = useMemo(
      () => ({
        callbacks,
        state
      }),
      [callbacks, state]
    );

    return (
      <GameContext.Provider value={contextValue}>
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
