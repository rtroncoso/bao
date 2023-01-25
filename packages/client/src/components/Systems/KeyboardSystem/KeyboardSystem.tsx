import React, { useContext, useEffect } from 'react';

import { GameContext } from '@bao/client/components/Game';
import { usePressedKeys } from './KeyboardSystem.hooks';

export interface KeyboardInputProps {}

export const KeyboardSystem: React.FC<KeyboardInputProps> = (props) => {
  const { callbacks, state } = useContext(GameContext);
  const inputs = usePressedKeys();

  useEffect(() => {
    if (state?.room) {
      callbacks.sendRoomMessage('input', { inputs });
    }
  }, [inputs]);

  return null;
};

export default KeyboardSystem;
