import { Graphics, Text, useTick } from '@inlet/react-pixi';
import { Filter } from 'pixi.js';
import React, { useEffect, useRef } from 'react';

import { CHARACTER_NAME_STYLES, roles } from '@bao/core';
import { App } from '@bao/core/constants';
import { useGameContext } from '@bao/client/components/Game';
import { useViewportContext } from '@bao/client/components/Systems/ViewportSystem';
import { TILE_SIZE } from '@bao/core/constants/game';
import { DEBUG_SHOW_PIXI_TILE_GRID } from '@bao/client/components/Entities/TiledMap/debugFlags';
import fragment from './grid.frag';
import vertex from './grid.vert';

export const DebugGridSystem = () => {
  const { callbacks } = useGameContext();
  const { viewportState, projectionRef, setViewportState } =
    useViewportContext();
  const { filter } = viewportState;
  const filterRef = useRef<Filter | null>(null);

  useEffect(() => {
    if (!DEBUG_SHOW_PIXI_TILE_GRID) {
      return;
    }

    try {
      const gridFilter = new Filter(vertex, fragment);
      gridFilter.uniforms.time = 0;
      gridFilter.uniforms.tileSize = TILE_SIZE;
      gridFilter.uniforms.position = [0, 0];
      gridFilter.uniforms.dimensions = [App.canvasWidth, App.canvasHeight];
      filterRef.current = gridFilter;

      if (setViewportState) {
        setViewportState({ filter: gridFilter });
      }
    } catch (error) {
      callbacks.leaveRoom(error);
    }
  }, [callbacks, setViewportState]);

  useTick((delta: number) => {
    const gridFilter = filterRef.current;
    if (!DEBUG_SHOW_PIXI_TILE_GRID || !gridFilter) {
      return;
    }

    gridFilter.uniforms.time += delta;

    const { x, y } = projectionRef.current;
    const [prevX, prevY] = gridFilter.uniforms.position;

    if (prevX !== x || prevY !== y) {
      gridFilter.uniforms.position = [x, y];
    }
  });

  if (!DEBUG_SHOW_PIXI_TILE_GRID) {
    return null;
  }

  return (
    filter && (
      <Graphics
        filters={[filter]}
        draw={(g) => {
          g.clear();
          g.beginFill(0x000);
          g.drawRect(0, 0, App.canvasWidth, App.canvasHeight);
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
        x={0}
        y={0}
        text={`
        X: ${currentCharacter.x.toFixed(2)}
        Y: ${currentCharacter.y.toFixed(2)}
      `}
      />
    )
  );
};
