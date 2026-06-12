import React, { useContext, useEffect, useRef } from 'react';

import { GameContext } from '@bao/client/components/Game';
import { useChatContext } from 'src/components/Chat';
import { usePressedKeys } from './KeyboardSystem.hooks';

export interface KeyboardInputProps {}

const inputsKey = (inputs: string[]) => inputs.join('\0');

export const KeyboardSystem: React.FC<KeyboardInputProps> = () => {
  const { callbacks, state } = useContext(GameContext);
  const { state: chatState } = useChatContext();
  const inputs = usePressedKeys();
  const lastSentKeyRef = useRef<string | null>(null);
  const chatFocusedRef = useRef(chatState.focused);
  const roomRef = useRef(state?.room);

  roomRef.current = state?.room;
  chatFocusedRef.current = chatState.focused;

  useEffect(() => {
    const room = roomRef.current;
    if (!room) {
      lastSentKeyRef.current = null;
      return;
    }

    if (chatFocusedRef.current) {
      return;
    }

    const key = inputsKey(inputs);
    if (key === lastSentKeyRef.current) {
      return;
    }

    lastSentKeyRef.current = key;
    room.send('input', { inputs });
  }, [inputs, chatState.focused, state?.room]);

  useEffect(() => {
    const room = roomRef.current;
    if (!room || !chatState.focused) {
      return;
    }

    const clearKey = inputsKey([]);
    if (lastSentKeyRef.current === clearKey) {
      return;
    }

    lastSentKeyRef.current = clearKey;
    room.send('input', { inputs: [] });
  }, [chatState.focused, state?.room]);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (chatFocusedRef.current) {
        return;
      }

      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const commandKey = isMac ? event.metaKey : event.ctrlKey;
      const key = event.key.toLowerCase();

      if (['s', 'd', 'f', 'g'].includes(key) && commandKey) {
        event.preventDefault();
      }

      if (key === 'g' && commandKey) {
        callbacks.updateGameState((draft) => {
          draft.debug = !draft.debug;
        });
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callbacks]);

  return null;
};

export default KeyboardSystem;
