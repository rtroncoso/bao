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
  focusedRef.current = state.focused;

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
      callbacks.sendRoomMessage('message', trimmed);
    } else {
      callbacks.sendRoomMessage('clearHead', null);
    }

    setMessage('');
    input.current?.blur();
    callbacks.setState({ focused: false });
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

    const focusCallback = () => callbacks.setState({ focused: true });
    const blurCallback = () => callbacks.setState({ focused: false });
    const keyPressCallback = (event: KeyboardEvent) => {
      if (!focusedRef.current && event.key.toLowerCase() === 'enter') {
        event.preventDefault();
        inputEl.focus();
      }
    };
    const keyDownCallback = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'escape') {
        inputEl.blur();
        callbacks.setState({ focused: false });
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
  }, [callbacks]);

  return (
    <ChatStyled focused={state.focused} onClick={handleChatClick}>
      <ChatMessageListStyled ref={chatList}>
        {state.messages.map(
          (message) =>
            message.message.trim() && (
              <ChatMessageStyled
                key={message.timestamp}
                options={message.options}
              >
                {message.character ? `${message.character.name}> ` : ''}
                {message.message.trim()}
              </ChatMessageStyled>
            )
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
