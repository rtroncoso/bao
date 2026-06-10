import { ArraySchema } from '@colyseus/schema';
import { Client, Room } from 'colyseus.js';
import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect
} from 'react';
import { useSelector } from 'react-redux';

import { Message } from '@bao/server/schema/MessageState';
import { ChatRoom } from '@bao/server/rooms/ChatRoom';
import { useGameContext } from '@bao/client/components/Game/Game.context';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';
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

    const handleSendRoomMessage = useCallback(
      (messageType, parameters) => {
        if (state.room) {
          return state.room.send(messageType, parameters);
        }

        console.warn(
          `[chat:handleSendRoomMessage]: Sending message to closed room ${messageType}:${JSON.stringify(
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
            `[chat:handleLeaveRoom]: exiting room with error "${error?.message}"`
          );
        }

        if (state.room) {
          state.room.leave(true);
          router.push('/');
          return;
        }

        console.warn(`[chat:handleLeaveRoom]: trying to leave a closed room`);
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
          `[chat:handleRoomError]: unhandled room error ${JSON.stringify(
            error,
            Object.getOwnPropertyNames(error),
            2
          )}`
        );
      },
      [router, resetState]
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
      try {
        const client = new Client(process.env.NEXT_PUBLIC_BAO_SERVER);
        const sessionId = gameState.room?.sessionId;
        if (!sessionId) {
          return router.push('/');
        }

        const room = await client.joinOrCreate<ChatRoom>(options.room, {
          characterId: gameState.characterId,
          sessionId,
          token
        });

        room.onError(handleRoomError);
        room.onMessage('*', handleRoomMessage);
        room.onLeave(() => handleRoomError({ message: 'LEAVE_ROOM' }));

        setState({
          connected: true,
          client,
          room
        });
      } catch (error) {
        console.error(
          `[chat:handleJoinRoom]: Error ${JSON.stringify(
            error,
            Object.getOwnPropertyNames(error),
            2
          )}`
        );

        return router.push('/');
      }
    }, [gameState, handleRoomError, handleRoomMessage, setState, token]);

    useEffect(() => {
      if (!gameState.connected || !gameState.room?.sessionId || !token) {
        return;
      }

      const localCharacter = resolveLocalCharacter(
        gameState.serverState,
        gameState.characterId,
        gameState.room.sessionId
      );

      if (!localCharacter) {
        return;
      }

      handleJoinRoom();

      return () => {
        handleLeaveRoom();
      };
    }, [
      gameState.characterId,
      gameState.connected,
      gameState.room?.sessionId,
      gameState.serverState,
      token
    ]);

    const callbacks = {
      setState,
      updateState,
      joinRoom: handleJoinRoom,
      leaveRoom: handleLeaveRoom,
      sendRoomMessage: handleSendRoomMessage
    };

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
