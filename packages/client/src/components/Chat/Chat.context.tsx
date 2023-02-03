import { ArraySchema } from '@colyseus/schema';
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

import { Message } from '@bao/server/schema/MessageState';
import { ChatRoom } from '@bao/server/rooms/ChatRoom';
import { SetStateCallback, useLocalStateReducer } from '@bao/client/hooks';
import { selectToken } from '@bao/client/queries/account';
import { State } from '@bao/client/store';

export interface ChatConnectedProps {
  token?: string | null;
}

export interface ChatContainerOptions {
  room: string;
}

export interface ChatComponentRouterState {
  characterId?: number;
}

export interface ChatContextState {
  client?: Client;
  connected?: boolean;
  focused?: boolean;
  room?: Room<ChatRoom>;
  messages: ArraySchema<Message>;
}

export interface ChatContextProps {
  callbacks: {
    setState: SetStateCallback<ChatContextState>;
    joinRoom: () => Promise<boolean>;
    leaveRoom: (error?: Error) => void;
    sendRoomMessage: (messageType: any, parameters: any) => void;
  };
  state: ChatContextState;
}

export const createChatInitialState = (): ChatContextState => ({
  connected: false,
  focused: false,
  messages: new ArraySchema<Message>()
});

export const createChatOptions = (): ChatContainerOptions => ({
  room: 'chat'
});

export const ChatContext = createContext<Partial<ChatContextProps>>({});

export const useChatContext = () => {
  return useContext(ChatContext);
};

export const ChatContainer = <P extends ChatConnectedProps>(
  Component: React.ComponentType<P>,
  options: ChatContainerOptions = createChatOptions()
) => {
  const WithChatContext: React.FC<ChatConnectedProps> = (props) => {
    if (typeof window === 'undefined') return null;
    const { token } = props;
    const router = useRouter();
    const [state, setState, resetState, updateState] =
      useLocalStateReducer<ChatContextState>(createChatInitialState());

    useEffect(() => {
      if (!router.query?.characterId) {
        router.push('/characters');
      }

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
      (type: 'message', message: Message) => {
        updateState((draft) => {
          draft.messages.push(message);
        });
        console.log(state, message);
      },
      [state, setState]
    );

    const handleJoinRoom = useCallback(async () => {
      try {
        const client = new Client(process.env.NEXT_PUBLIC_BAO_SERVER);
        const room = await client.joinOrCreate<ChatRoom>(options.room, {
          characterId: router.query?.characterId as string,
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
    }, [handleRoomError, handleRoomMessage, setState, token]);

    useEffect(() => {
      handleJoinRoom();
      return handleLeaveRoom;
    }, []);

    const callbacks = {
      setState,
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

  const mapStateToProps = (state: State) => ({
    token: selectToken(state)
  });

  return compose(connect(mapStateToProps))(WithChatContext);
};

export const withChatContextOptions =
  <P extends ChatConnectedProps>(options: ChatContainerOptions) =>
  (Component: React.ComponentType<P>) =>
    ChatContainer(Component, options);

export const withChatContext = ChatContainer;
