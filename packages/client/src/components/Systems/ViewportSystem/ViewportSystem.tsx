import { Container, Graphics, Text, useTick } from '@inlet/react-pixi';
import { Container as PixiContainer, Filter } from 'pixi.js';
import React, { createContext, useContext, useEffect, useRef } from 'react';

import { defaultTextStyle, GameContext } from '@mob/client/components/Game';
import { SetStateCallback, useLocalStateReducer } from '@mob/client/hooks';
import { TILE_SIZE, App } from '@mob/core/constants/game';
import { CharacterState } from '@mob/server/schema/CharacterState';

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
    y: 0,
  },
});

export const ViewportContext = createContext<ViewportContextState>({
  setViewportState: null,
  viewportState: createInitialViewportState(),
});

export const useViewport = () => {
  return useContext(ViewportContext);
};

export const DebugGridSystem = () => {
  const { callbacks } = useContext(GameContext);
  const { viewportState, setViewportState } = useViewport();

  const {
    filter,
    projection,
  } = viewportState;

  useEffect(() => {
    const vertex = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;

      uniform mat3 projectionMatrix;
      varying vec2 vTextureCoord;

      void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
      }
    `;
    const fragment = `
      precision mediump float;

      varying vec2 vTextureCoord;
      varying vec4 vColor;

      uniform sampler2D uSampler;
      uniform vec2 position;
      uniform vec2 dimensions;
      uniform float time;

      void main(void)
      {
        vec2 uvs = vTextureCoord.xy;
        vec4 fg = texture2D(uSampler, uvs);

        vec2 worldSpace;
        vec2 tileGrid;
        vec3 color;

        worldSpace.x = uvs.x + (position.x / dimensions.x);
        worldSpace.y = uvs.y + (position.y / dimensions.y);
        tileGrid.x = fract(worldSpace.x * (dimensions.x / ${TILE_SIZE.toFixed(1)}));
        tileGrid.y = fract(worldSpace.y * (dimensions.y / ${TILE_SIZE.toFixed(1)}));

        if (
          (tileGrid.x <= 0.05 || tileGrid.x >= 0.95) ||
          (tileGrid.y <= 0.05 || tileGrid.y >= 0.95)
        ) {
          color.x = .3;
        }

        gl_FragColor = vec4(color, .3);
      }
    `;

    try {
      const filter = new Filter(vertex, fragment);
      filter.uniforms.time = 0;
      filter.uniforms.position = [0.0, 0.0];
      filter.uniforms.dimensions = [
        viewportState.projection.width,
        viewportState.projection.height
      ];

      if (setViewportState) {
        setViewportState({ filter });
      }
    } catch (error) {
      callbacks.handleLeaveRoom(error);
    }
  }, []); // eslint-disable-line

  useTick((delta) => {
    if (filter) {
      filter.uniforms.time += delta;
      filter.uniforms.position = [projection.x, projection.y];

      if (setViewportState) {
        setViewportState({ ...viewportState });
      }
    }
  });

  return viewportState.filter && (
    <Graphics
      filters={[viewportState.filter]}
      draw={g => {
        g.clear();
        g.drawRect(
          viewportState.projection.x,
          viewportState.projection.y,
          viewportState.projection.width,
          viewportState.projection.height
        );
        g.endFill();
      }}
    />
  );
};

export const DebugTextSystem: React.FC = () => {
  const { viewportState } = useViewport();
  const { currentCharacter } = viewportState;

  return currentCharacter && (
    <Text
      style={defaultTextStyle}
      x={viewportState.projection.x}
      y={viewportState.projection.y}
      text={`
        X: ${currentCharacter.x.toFixed(2)}
        Y: ${currentCharacter.y.toFixed(2)}
      `}
    />
  );
};

export const ViewportSystem: React.FC<ViewportProps> = (props) => {
  const [viewportState, setViewportState] = useLocalStateReducer(createInitialViewportState());
  const viewport = useRef<PixiContainer>(null);
  const { state } = useContext(GameContext);

  const { room, serverState } = state!;
  const { children } = props;

  useTick(() => {
    if (serverState && room) {
      const currentCharacter = serverState.characters.has(room.sessionId)
        ? serverState.characters.get(room.sessionId)
        : null;

        if (currentCharacter) {
        const x = currentCharacter.x - (viewportState.projection.width / 2);
        const y = currentCharacter.y - (viewportState.projection.height / 2);

        if (x !== viewportState.projection.x || y !== viewportState.projection.y) {
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
    viewportState,
  };

  return (
    <ViewportContext.Provider
      value={viewportContext}
    >
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
