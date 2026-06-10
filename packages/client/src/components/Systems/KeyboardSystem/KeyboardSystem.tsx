import React, { useContext, useEffect } from 'react';

import { GameContext } from '@bao/client/components/Game';
import { usePressedKeys } from './KeyboardSystem.hooks';
import { useViewportContext } from '../ViewportSystem';

export interface KeyboardInputProps {}

export const KeyboardSystem: React.FC<KeyboardInputProps> = (props) => {
  const { callbacks, state } = useContext(GameContext);
  const inputs = usePressedKeys();

  useEffect(() => {
    if (state?.room) {
      callbacks.sendRoomMessage('input', { inputs });
    }
  }, [inputs]);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
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
