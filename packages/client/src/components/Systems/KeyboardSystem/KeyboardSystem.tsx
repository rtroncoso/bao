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
      const commandKey = navigator.platform.match('Mac')
        ? event.metaKey
        : event.ctrlKey;

      if (['s', 'd', 'f', 'g'].includes(event.key) && commandKey) {
        event.preventDefault();
      }

      if (event.key === 'g' && event.ctrlKey) {
        callbacks.updateGameState((draft) => {
          draft.debug = !draft.debug;
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown, false);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state]);

  return null;
};

export default KeyboardSystem;
