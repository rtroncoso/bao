import { Graphics, Text, useTick } from '@inlet/react-pixi';
import { Filter } from 'pixi.js';
import React, { useEffect } from 'react';

import { defaultTextStyle, useGame } from '@mob/client/components/Game';
import { TILE_SIZE } from '@mob/core/constants/game';
import { useViewport } from './ViewportSystem';

export const DebugGridSystem = () => {
  const { callbacks } = useGame();
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
          (tileGrid.x <= 0.02 || tileGrid.x >= 0.98)
        ) {
          color.r = tileGrid.x * (sin(time * .01) * 0.5 + 0.5);
          color.g = (tileGrid.x + tileGrid.y) * (sin(time * .01) * 0.5 + 0.5);
          color.b = tileGrid.y * (sin(time * .01) * 0.5 + 0.5);
          color.r = clamp(color.r, 0.2, 0.4);
          color.g = clamp(color.g, 0.1, 0.3);
          color.b = clamp(color.b, 0.4, 0.8);
        }
        if (
          (tileGrid.y <= 0.02 || tileGrid.y >= 0.98)
        ) {
          color.r = tileGrid.x + (cos(time * .01) * 0.5 + 0.5);
          color.g = (worldSpace.x + worldSpace.y) * (cos(time * .01) * 0.5 + 0.5);
          color.b = tileGrid.y + (cos(time * .01) * 0.5 + 0.5);
          color.r = clamp(color.r, 0.2, 0.4);
          color.g = clamp(color.g, 0.1, 0.3);
          color.b = clamp(color.b, 0.4, 0.8);
        }

        gl_FragColor = vec4(color, .2);
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
      filter.uniforms.position = [
        projection.x ? projection.x.toFixed(2) : 0,
        projection.y ? projection.y.toFixed(2) : 0
      ];

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
