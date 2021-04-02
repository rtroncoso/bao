import React, { useContext } from 'react';

import { GameContext } from '@mob/client/components/Game';
import { useKeyPress } from './KeyboardSystem.hooks';

export interface KeyboardInputProps {}

export const KeyboardSystem: React.FC<KeyboardInputProps> = (props) => {
  const { callbacks } = useContext(GameContext);

  const isNorthPressed = useKeyPress('w');
  const isEastPressed = useKeyPress('d');
  const isSouthPressed = useKeyPress('s');
  const isWestPressed = useKeyPress('a');

  if (isNorthPressed) {
    callbacks.handleSendRoomMessage('move', { heading: 'north' });
  }
  if (isEastPressed) {
    callbacks.handleSendRoomMessage('move', { heading: 'east' });
  }
  if (isSouthPressed) {
    callbacks.handleSendRoomMessage('move', { heading: 'south' });
  }
  if (isWestPressed) {
    callbacks.handleSendRoomMessage('move', { heading: 'west' });
  }

  return null;
};

export default KeyboardSystem;
