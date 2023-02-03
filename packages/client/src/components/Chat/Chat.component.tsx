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
  const input = useRef<HTMLInputElement>();
  const chatList = useRef<HTMLUListElement>();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key.toLowerCase() === 'enter') {
      input.current?.blur();
      callbacks.sendRoomMessage('message', message);
      setMessage('');
    }
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
    const focusCallback = () => callbacks.setState({ focused: true });
    const blurCallback = () => callbacks.setState({ focused: false });
    const keyPressCallback = (event: KeyboardEvent) => {
      if (!state.focused && event.key.toLowerCase() === 'enter') {
        input.current?.focus();
      }
    };
    const keyDownCallback = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'escape') {
        input.current?.blur();
      }
    };

    input.current?.addEventListener('focus', focusCallback);
    input.current?.addEventListener('blur', blurCallback);
    window.addEventListener('keypress', keyPressCallback);
    window.addEventListener('keydown', keyDownCallback);

    return () => {
      input.current?.removeEventListener('focus', focusCallback);
      input.current?.removeEventListener('blur', blurCallback);
      window.removeEventListener('keypress', keyPressCallback);
      window.removeEventListener('keydown', keyDownCallback);
    };
  }, [state, input.current]);

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
        onKeyPress={handleKeyPress}
      />
    </ChatStyled>
  );
};

export default ChatComponent;
