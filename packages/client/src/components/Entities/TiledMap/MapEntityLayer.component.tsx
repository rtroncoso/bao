import React, { useMemo } from 'react';
import { Container, Sprite } from '@inlet/react-pixi';
import { useSelector } from 'react-redux';

import { getTexture, TILE_SIZE } from '@bao/core';
import { useGameContext } from '@bao/client/components/Game/Game.context';
import {
  useMapContext,
  useViewportContext
} from '@bao/client/components/Systems';
import { selectGraphics } from '@bao/client/queries';
import { State } from '@bao/client/store';

import { ENTITIES_LAYER } from '@bao/core/constants/game/Map';

export const MapEntityLayer: React.FC = () => {
  const graphics = useSelector((state: State) => selectGraphics(state));
  const { mapState } = useMapContext();
  const { viewportState } = useViewportContext();
  const { state: gameState } = useGameContext();

  const mapEntities = useMemo(() => {
    const maps = gameState?.serverState?.maps;
    const mapId = viewportState?.currentCharacter?.mapId ?? 34;
    const currentMap = maps?.get(String(mapId));

    if (!currentMap) {
      return [];
    }

    return [...currentMap.npcs, ...currentMap.objects];
  }, [gameState?.serverState?.maps, viewportState?.currentCharacter?.mapId]);

  return (
    <Container parentGroup={mapState?.groups[ENTITIES_LAYER]}>
      {mapEntities.map((entity) => {
        const graphic = graphics?.[entity.graphicId];
        if (!graphic?.path) {
          return null;
        }

        return (
          <Sprite
            key={entity.id}
            texture={getTexture(graphic)}
            x={entity.x * TILE_SIZE}
            y={entity.y * TILE_SIZE}
          />
        );
      })}
    </Container>
  );
};
