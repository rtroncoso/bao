import { Container, useTick } from '@inlet/react-pixi';
import { Container as PixiContainer, Filter } from 'pixi.js';
import React, { createContext, useContext, useRef } from 'react';

import { useGame } from '@mob/client/components/Game';
import { SetStateCallback, useLocalStateReducer } from '@mob/client/hooks';
import { App } from '@mob/core/constants/game';
import { CharacterState } from '@mob/server/schema/CharacterState';
import { DebugGridSystem, DebugTextSystem } from './DebugSystems';

export interface ViewportProps {
  children?: React.ReactNode;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle extends Vector2 {
  width: number;
  height: number;
}
export interface ViewportSystemState {
  currentCharacter: CharacterState | null;
  filter: Filter | null;
  projection: Rectangle;
}

export interface ViewportContextState {
  setViewportState: SetStateCallback<ViewportSystemState> | null;
  viewportState: ViewportSystemState;
}

export const createInitialViewportState = (): ViewportSystemState => ({
  currentCharacter: null,
  filter: null,
  projection: {
    height: App.canvasHeight,
    width: App.canvasWidth,
    x: 0,
    y: 0
  }
});

export const ViewportContext = createContext<ViewportContextState>({
  setViewportState: null,
  viewportState: createInitialViewportState()
});

export const useViewport = () => {
  return useContext(ViewportContext);
};

export const ViewportSystem: React.FC<ViewportProps> = (
  props: ViewportProps
) => {
  const [viewportState, setViewportState] = useLocalStateReducer(
    createInitialViewportState()
  );
  const viewport = useRef<PixiContainer>(null);
  const { state } = useGame();

  const { room, serverState } = state;
  const { children } = props;

  useTick(() => {
    if (serverState && room) {
      const currentCharacter = serverState.characters.has(room.sessionId)
        ? serverState.characters.get(room.sessionId)
        : null;

      if (currentCharacter) {
        const x = currentCharacter.x - viewportState.projection.width / 2;
        const y = currentCharacter.y - viewportState.projection.height / 2;

        if (
          x !== viewportState.projection.x ||
          y !== viewportState.projection.y
        ) {
          const projection = {
            ...viewportState.projection,
            x,
            y
          };

          setViewportState({
            currentCharacter,
            projection
          });
        }
      }
    }
  });

  const viewportContext = {
    setViewportState,
    viewportState
  };

  return (
    <ViewportContext.Provider value={viewportContext}>
      {viewportState && (
        <Container
          ref={viewport}
          x={-viewportState.projection.x}
          y={-viewportState.projection.y}
        >
          <DebugGridSystem />
          <DebugTextSystem />
          {children as React.ReactElement}
        </Container>
      )}
    </ViewportContext.Provider>
  );
};
