import { Container, useTick } from '@inlet/react-pixi';
import { Container as PixiContainer, Filter } from 'pixi.js';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react';
import lerp from 'lerp';

import {
  DebugGridSystem,
  DebugTextSystem
} from '@bao/client/components/Systems/DebugSystem';
import { useGameContext } from '@bao/client/components/Game';
import { useMapContext } from '@bao/client/components/Systems/MapRenderingSystem';
import {
  SetStateCallback,
  UpdateStateCallback,
  useLocalStateReducer
} from '@bao/client/hooks';
import { App } from '@bao/core/constants/game';
import { CharacterState } from '@bao/server/schema/CharacterState';

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
  updateViewportState: UpdateStateCallback<ViewportSystemState> | null;
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
  updateViewportState: null,
  viewportState: createInitialViewportState()
});

export const useViewportContext = () => {
  return useContext(ViewportContext);
};

export const ViewportSystem: React.FC<ViewportProps> = (
  props: ViewportProps
) => {
  const [viewportState, setViewportState, , updateViewportState] =
    useLocalStateReducer(createInitialViewportState());
  const viewport = useRef<PixiContainer>(null);
  const { state } = useGameContext();
  const { mapState } = useMapContext();
  const { room, serverState } = state;
  const { children } = props;

  const currentCharacter = useMemo(
    () =>
      serverState.characters.find(
        (character) => character.sessionId === room.sessionId
      ),
    []
  );

  useEffect(() => {
    if (currentCharacter && mapState.groups.length) {
      const x = currentCharacter.x - viewportState.projection.width / 2;
      const y = currentCharacter.y - viewportState.projection.height / 2;
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
  }, [currentCharacter, mapState]);

  useTick(() => {
    if (serverState && room) {
      if (currentCharacter) {
        const x = lerp(
          viewportState.projection.x,
          currentCharacter.x - viewportState.projection.width / 2,
          1 / 3
        );
        const y = lerp(
          viewportState.projection.y,
          currentCharacter.y - viewportState.projection.height / 2,
          1 / 3
        );

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
    updateViewportState,
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
          {state.debug && <DebugGridSystem />}
          {children}
          {state.debug && <DebugTextSystem />}
        </Container>
      )}
    </ViewportContext.Provider>
  );
};
