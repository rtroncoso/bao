import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { ChatConnectedProps, useChatContext } from './Chat.context';
import { ChatInputStyled, ChatMessageStyled, ChatStyled } from './Chat.styles';

export type ChatComponentProps = ChatConnectedProps;

export const ChatComponent: React.FC<ChatComponentProps> = () => {
  const { callbacks, state } = useChatContext();
  const [message, setMessage] = useState('');
  const input = useRef<HTMLInputElement>();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
    event.preventDefault();
    event.stopPropagation();
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key.toLowerCase() === 'enter') {
      callbacks.sendRoomMessage('message', message);
      input.current?.blur();
      setMessage('');
    }
  };

  const handleChatClick = () => {
    input.current?.focus();
    console.log(state.messages);
  };

  useEffect(() => {
    const focusCallback = () => callbacks.setState({ focused: true });
    const blurCallback = () => callbacks.setState({ focused: false });
    const keyPressCallback = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'enter') {
        input.current?.focus();
      }
    };

    input.current?.addEventListener('focus', focusCallback);
    input.current?.addEventListener('blur', blurCallback);
    window.addEventListener('keypress', keyPressCallback);

    return () => {
      input.current?.removeEventListener('focus', focusCallback);
      input.current?.removeEventListener('blur', blurCallback);
      window.removeEventListener('keypress', keyPressCallback);
    };
  }, [input.current]);

  return (
    <ChatStyled focused={state.focused} onClick={handleChatClick}>
      {state.messages.map((message) => {
        <ChatMessageStyled>
          {message.character ? `${message.character.name}> ` : ''}
          {message.message}
        </ChatMessageStyled>;
      })}
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
