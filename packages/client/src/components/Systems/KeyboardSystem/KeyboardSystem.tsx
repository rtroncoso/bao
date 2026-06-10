import React, { useContext, useEffect } from 'react';

import { GameContext } from '@bao/client/components/Game';
import { useChatContext } from 'src/components/Chat';
import { usePressedKeys } from './KeyboardSystem.hooks';

export interface KeyboardInputProps {}

export const KeyboardSystem: React.FC<KeyboardInputProps> = () => {
  const { callbacks, state } = useContext(GameContext);
  const { state: chatState } = useChatContext();
  const inputs = usePressedKeys();

  useEffect(() => {
    if (!state?.room) {
      return;
    }

    callbacks.sendRoomMessage('input', {
      inputs: chatState.focused ? [] : inputs
    });
  }, [inputs, chatState.focused, state?.room, callbacks]);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (chatState.focused) {
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
  }, [callbacks, chatState.focused]);

  return null;
};

export default KeyboardSystem;
