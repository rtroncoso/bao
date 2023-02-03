import { Graphics, Text, useTick } from '@inlet/react-pixi';
import { Filter } from 'pixi.js';
import React, { useEffect } from 'react';

import { CHARACTER_NAME_STYLES, roles } from '@bao/core';
import { useGameContext } from '@bao/client/components/Game';
import { useViewportContext } from '@bao/client/components/Systems/ViewportSystem';
import { TILE_SIZE } from '@bao/core/constants/game';
import fragment from './grid.frag';
import vertex from './grid.vert';

export const DebugGridSystem = () => {
  const { callbacks } = useGameContext();
  const { viewportState, setViewportState } = useViewportContext();
  const { filter, projection } = viewportState;

  useEffect(() => {
    try {
      const filter = new Filter(vertex, fragment);
      filter.uniforms.time = 0;
      filter.uniforms.tileSize = TILE_SIZE.toFixed(1);
      filter.uniforms.position = [0.0, 0.0];
      filter.uniforms.dimensions = [
        viewportState.projection.width,
        viewportState.projection.height
      ];

      if (setViewportState) {
        setViewportState({ filter });
      }
    } catch (error) {
      callbacks.leaveRoom(error);
    }
  }, []);

  useTick((delta: number) => {
    if (filter) {
      filter.uniforms.time += delta;

      const x = projection.x ? projection.x.toFixed(2) : 0;
      const y = projection.y ? projection.y.toFixed(2) : 0;

      const hasChanges =
        filter.uniforms.position[0] !== x || filter.uniforms.position[1] !== y;

      if (hasChanges) {
        filter.uniforms.position = [x, y];
      }
    }
  });

  return (
    viewportState.filter && (
      <Graphics
        filters={[viewportState.filter]}
        draw={(g) => {
          g.clear();
          g.beginFill(0x000);
          g.drawRect(
            viewportState.projection.x,
            viewportState.projection.y,
            viewportState.projection.width,
            viewportState.projection.height
          );
          g.endFill();
        }}
      />
    )
  );
};

export const DebugTextSystem: React.FC = () => {
  const { viewportState } = useViewportContext();
  const { currentCharacter } = viewportState;

  return (
    currentCharacter && (
      <Text
        style={CHARACTER_NAME_STYLES[roles.user]}
        x={viewportState.projection.x}
        y={viewportState.projection.y}
        text={`
        X: ${currentCharacter.x.toFixed(2)}
        Y: ${currentCharacter.y.toFixed(2)}
      `}
      />
    )
  );
};
