import React, { useEffect, useRef, useState } from 'react';
import { ChatConnectedProps, useChatContext } from './Chat.context';
import {
  ChatInputStyled,
  ChatMessageListStyled,
  ChatMessageStyled,
  ChatStyled
} from './Chat.styles';

export type ChatComponentProps = ChatConnectedProps;

export const ChatComponent: React.FC<ChatComponentProps> = () => {
  const { callbacks, state } = useChatContext();
  const [message, setMessage] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const chatList = useRef<HTMLUListElement>(null);
  const focusedRef = useRef(state.focused);
  const sendRoomMessageRef = useRef(callbacks.sendRoomMessage);
  const setStateRef = useRef(callbacks.setState);

  focusedRef.current = state.focused;
  sendRoomMessageRef.current = callbacks.sendRoomMessage;
  setStateRef.current = callbacks.setState;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    const trimmed = message.trim();
    if (trimmed) {
      sendRoomMessageRef.current('message', trimmed);
    } else {
      sendRoomMessageRef.current('clearHead', null);
    }

    setMessage('');
    input.current?.blur();
    setStateRef.current({ focused: false });
  };

  const handleChatClick = () => {
    input.current?.focus();
  };

  useEffect(() => {
    chatList.current?.scrollTo({
      top: chatList.current?.scrollHeight,
      behavior: 'smooth'
    });
  }, [state.messages.length]);

  useEffect(() => {
    const inputEl = input.current;
    if (!inputEl) {
      return;
    }

    const focusCallback = () => setStateRef.current({ focused: true });
    const blurCallback = () => setStateRef.current({ focused: false });
    const keyPressCallback = (event: KeyboardEvent) => {
      if (!focusedRef.current && event.key.toLowerCase() === 'enter') {
        event.preventDefault();
        inputEl.focus();
      }
    };
    const keyDownCallback = (event: KeyboardEvent) => {
      if (!focusedRef.current) {
        return;
      }

      if (event.key.toLowerCase() === 'escape') {
        inputEl.blur();
        setStateRef.current({ focused: false });
      }
    };

    inputEl.addEventListener('focus', focusCallback);
    inputEl.addEventListener('blur', blurCallback);
    window.addEventListener('keypress', keyPressCallback);
    window.addEventListener('keydown', keyDownCallback);

    return () => {
      inputEl.removeEventListener('focus', focusCallback);
      inputEl.removeEventListener('blur', blurCallback);
      window.removeEventListener('keypress', keyPressCallback);
      window.removeEventListener('keydown', keyDownCallback);
    };
  }, []);

  return (
    <ChatStyled focused={state.focused} onClick={handleChatClick}>
      <ChatMessageListStyled ref={chatList}>
        {state.messages.map((entry, index) =>
          entry.message.trim() ? (
            <ChatMessageStyled
              key={`${entry.character?.sessionId ?? 'system'}-${
                entry.timestamp
              }-${index}`}
              options={entry.options}
            >
              {entry.character ? `${entry.character.name}> ` : ''}
              {entry.message.trim()}
            </ChatMessageStyled>
          ) : null
        )}
      </ChatMessageListStyled>
      <ChatInputStyled
        ref={input}
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
    </ChatStyled>
  );
};

export default ChatComponent;
