import { Container, Text, useTick } from '@inlet/react-pixi';
import { Container as PixiContainer } from 'pixi.js';
import React, { useContext, useRef } from 'react';

import { defaultTextStyle, GameContext } from '@mob/client/components/Game';
import AppConstants from '@mob/core/constants/game/App';
import { useLocalStateReducer } from '@/hooks';

export interface ViewportProps {
  children?: React.ReactNode;
}

export const createInitialViewportState = () => ({
  x: 0,
  y: 0
});

export const ViewportSystem: React.FC<ViewportProps> = (props) => {
  const [viewportState, setViewportState] = useLocalStateReducer(createInitialViewportState());
  const viewport = useRef<PixiContainer>(null);
  const { state } = useContext(GameContext);

  const { room, gameState } = state!;
  const { children } = props;

  useTick(() => {
    if (gameState && room) {
      const currentCharacter = gameState.characters.has(room.sessionId)
        ? gameState.characters.get(room.sessionId)
        : null;

      if (currentCharacter) {
        const x = currentCharacter.x - (AppConstants.canvasWidth / 2) + 50;
        const y = currentCharacter.y - (AppConstants.canvasHeight / 2) + 50
        setViewportState({ x, y });
      }
    }
  });

  return viewportState && (
    <Container ref={viewport} x={-viewportState.x} y={-viewportState.y}>
      <Text
        style={defaultTextStyle}
        text={`${-viewportState.x}, ${-viewportState.y}`}
      />
      {children as React.ReactElement}
    </Container>
  );
}
