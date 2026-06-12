import { ArraySchema } from '@colyseus/schema';
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
import { useSelector } from 'react-redux';

import { Message } from '@bao/server/schema/MessageState';
import { ChatRoom } from '@bao/server/rooms/ChatRoom';
import { useGameContext } from '@bao/client/components/Game/Game.context';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';
import { createBaoClient } from '@bao/client/lib/colyseusClient';
import {
  formatColyseusConnectError,
  getBaoServerUrl
} from '@bao/client/lib/baoUrls';
import {
  SetStateCallback,
  UpdateStateCallback,
  useLocalStateReducer
} from '@bao/client/hooks';
import { selectToken } from '@bao/client/queries/account';

export interface ChatConnectedProps {
  token?: string | null;
}

export interface ChatContextContainerOptions {
  room: string;
}

export interface ChatComponentRouterState {
  characterId?: number;
}

export interface HeadDisplay {
  text: string;
  token: number;
}

export interface ClearHeadPayload {
  character?: Message['character'];
  timestamp: number;
}

export interface ChatContextState {
  client?: Client;
  connected?: boolean;
  focused?: boolean;
  room?: Room<ChatRoom>;
  /** Colyseus session id for this client's chat room connection. */
  chatSessionId?: string;
  messages: ArraySchema<Message>;
  /** Speech bubbles above characters — separate from the chat log. */
  headDisplayBySession: Record<string, HeadDisplay>;
}

export interface ChatContextProps {
  callbacks: {
    setState: SetStateCallback<ChatContextState>;
    updateState: UpdateStateCallback<ChatContextState>;
    joinRoom: () => Promise<boolean>;
    leaveRoom: (error?: Error) => void;
    sendRoomMessage: (messageType: any, parameters: any) => void;
  };
  state: ChatContextState;
}

export const createChatInitialState = (): ChatContextState => ({
  connected: false,
  focused: false,
  messages: new ArraySchema<Message>(),
  headDisplayBySession: {}
});

export const createChatOptions = (): ChatContextContainerOptions => ({
  room: 'chat'
});

export const ChatContext = createContext<Partial<ChatContextProps>>({});

export const useChatContext = () => {
  return useContext(ChatContext);
};

export const ChatContextContainer = <P extends ChatConnectedProps>(
  Component: React.ComponentType<P>,
  options: ChatContextContainerOptions = createChatOptions()
) => {
  const WithChatContext: React.FC<ChatConnectedProps> = (props) => {
    if (typeof window === 'undefined') return null;
    const router = useRouter();
    const token = useSelector(selectToken);
    const [state, setState, resetState, updateState] =
      useLocalStateReducer<ChatContextState>(createChatInitialState());
    const { state: gameState } = useGameContext();

    const chatRoomRef = useRef<Room<ChatRoom>>();
    const joiningRef = useRef(false);
    const gameStateRef = useRef(gameState);
    gameStateRef.current = gameState;

    const hasLocalCharacter = Boolean(
      resolveLocalCharacter(
        gameState.serverState,
        gameState.characterId,
        gameState.room?.sessionId
      )
    );

    const disconnectChatRoom = useCallback(() => {
      const room = chatRoomRef.current;
      if (!room) {
        return;
      }

      room.removeAllListeners();
      room.leave(true);
      chatRoomRef.current = undefined;
      setState({
        connected: false,
        room: undefined,
        client: undefined,
        chatSessionId: undefined
      });
    }, [setState]);

    const handleSendRoomMessage = useCallback((messageType, parameters) => {
      const room = chatRoomRef.current;
      if (room) {
        return room.send(messageType, parameters);
      }

      console.warn(
        `[chat:handleSendRoomMessage]: Sending message to closed room ${messageType}:${JSON.stringify(
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
            `[chat:handleLeaveRoom]: exiting room with error "${error?.message}"`
          );
        }

        disconnectChatRoom();
        resetState();

        if (error) {
          router.push('/');
        }
      },
      [disconnectChatRoom, resetState, router]
    );

    const handleRoomError = useCallback(
      (error: any) => {
        if (error?.message === 'LEAVE_ROOM') {
          disconnectChatRoom();
          resetState();
          return;
        }

        console.warn(
          `[chat:handleRoomError]: unhandled room error ${JSON.stringify(
            error,
            Object.getOwnPropertyNames(error),
            2
          )}`
        );
      },
      [disconnectChatRoom, resetState]
    );

    const handleRoomMessage = useCallback(
      (type: string, payload: Message | ClearHeadPayload) => {
        if (type === 'clearHead') {
          const { character, timestamp } = payload as ClearHeadPayload;
          const sessionId = character?.sessionId;
          if (!sessionId) {
            return;
          }

          updateState((draft) => {
            draft.headDisplayBySession[sessionId] = {
              text: '',
              token: timestamp
            };
          });
          return;
        }

        const message = payload as Message;
        if (typeof message?.message !== 'string' || !message.message.trim()) {
          return;
        }

        updateState((draft) => {
          draft.messages.push(message);
          const sessionId = message.character?.sessionId;
          if (sessionId) {
            draft.headDisplayBySession[sessionId] = {
              text: message.message,
              token: message.timestamp
            };
          }
        });
      },
      [updateState]
    );

    const handleJoinRoom = useCallback(async () => {
      if (joiningRef.current || chatRoomRef.current) {
        return false;
      }

      const currentGameState = gameStateRef.current;
      const worldSessionId = currentGameState.room?.sessionId;
      if (!worldSessionId || !token) {
        return false;
      }

      const localCharacter = resolveLocalCharacter(
        currentGameState.serverState,
        currentGameState.characterId,
        worldSessionId
      );
      if (!localCharacter) {
        return false;
      }

      joiningRef.current = true;
      const serverUrl = getBaoServerUrl();

      try {
        const client = createBaoClient();
        const room = await client.joinOrCreate<ChatRoom>(options.room, {
          characterId: currentGameState.characterId,
          sessionId: worldSessionId,
          token
        });

        chatRoomRef.current = room;

        room.onError(handleRoomError);
        room.onMessage('*', handleRoomMessage);
        room.onLeave(() => handleRoomError({ message: 'LEAVE_ROOM' }));

        setState({
          connected: true,
          client,
          room,
          chatSessionId: room.sessionId
        });

        return true;
      } catch (error: unknown) {
        console.error(
          `[chat:handleJoinRoom]: ${formatColyseusConnectError(
            error,
            serverUrl
          )}`,
          error
        );

        return false;
      } finally {
        joiningRef.current = false;
      }
    }, [handleRoomError, handleRoomMessage, setState, token]);

    const handleJoinRoomRef = useRef(handleJoinRoom);
    handleJoinRoomRef.current = handleJoinRoom;

    useEffect(() => {
      if (
        !gameState.connected ||
        !gameState.room?.sessionId ||
        !token ||
        !hasLocalCharacter
      ) {
        return;
      }

      if (chatRoomRef.current || joiningRef.current) {
        return;
      }

      void handleJoinRoomRef.current();

      return () => {
        disconnectChatRoom();
      };
    }, [
      disconnectChatRoom,
      gameState.characterId,
      gameState.connected,
      gameState.room?.sessionId,
      hasLocalCharacter,
      token
    ]);

    const callbacks = useMemo(
      () => ({
        setState,
        updateState,
        joinRoom: handleJoinRoom,
        leaveRoom: handleLeaveRoom,
        sendRoomMessage: handleSendRoomMessage
      }),
      [
        handleJoinRoom,
        handleLeaveRoom,
        handleSendRoomMessage,
        setState,
        updateState
      ]
    );

    return (
      <ChatContext.Provider
        value={{
          callbacks,
          state
        }}
      >
        <Component {...(props as P)} />
      </ChatContext.Provider>
    );
  };

  return WithChatContext;
};

export const withChatContextOptions =
  <P extends ChatConnectedProps>(options: ChatContextContainerOptions) =>
  (Component: React.ComponentType<P>) =>
    ChatContextContainer(Component, options);

export const withChatContext = ChatContextContainer;
