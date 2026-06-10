import React, { useMemo } from 'react';
import { Container, Sprite } from '@inlet/react-pixi';
import { useSelector } from 'react-redux';

import { getTexture, Graphic, TILE_SIZE } from '@bao/core';
import { Animation } from '@bao/client/components/Pixi';
import { useGameContext } from '@bao/client/components/Game/Game.context';
import { useMapContext } from '@bao/client/components/Systems';
import { selectGraphics } from '@bao/client/queries';
import { State } from '@bao/client/store';

import { ENTITIES_LAYER } from '@bao/core/constants/game/Map';
import { MapNpcEntity } from './MapNpcEntity.component';

const hasAnimationFrames = (graphic: Graphic) =>
  Array.isArray(graphic.frames) && graphic.frames.length > 0;

export interface MapEntityLayerProps {
  mapId: number;
}

export const MapEntityLayer: React.FC<MapEntityLayerProps> = ({ mapId }) => {
  const graphics = useSelector((state: State) => selectGraphics(state));
  const { mapState } = useMapContext();
  const { state: gameState } = useGameContext();

  const { npcs, objects } = useMemo(() => {
    const maps = gameState?.serverState?.maps;
    const currentMap = maps?.get(String(mapId));

    if (!currentMap) {
      return { npcs: [], objects: [] };
    }

    const npcList = [];
    const objectList = [];

    if (currentMap.npcs) {
      for (const entity of currentMap.npcs) {
        npcList.push(entity);
      }
    }
    if (currentMap.objects) {
      for (const entity of currentMap.objects) {
        objectList.push(entity);
      }
    }

    return { npcs: npcList, objects: objectList };
  }, [gameState?.serverState?.maps, mapId]);

  return (
    <Container parentGroup={mapState?.groups[ENTITIES_LAYER]}>
      {npcs.map((entity) => (
        <MapNpcEntity
          key={entity.id}
          id={entity.id}
          bodyId={entity.bodyId}
          headId={entity.headId}
          heading={entity.heading}
          x={entity.x}
          y={entity.y}
        />
      ))}
      {objects.map((entity) => {
        const graphic = graphics?.[entity.graphicId];
        if (!graphic) {
          return null;
        }

        const x = entity.x * TILE_SIZE;
        const y = entity.y * TILE_SIZE;

        if (hasAnimationFrames(graphic)) {
          return <Animation key={entity.id} animation={graphic} x={x} y={y} />;
        }

        const texture = getTexture(graphic);
        if (!texture) {
          return null;
        }

        return <Sprite key={entity.id} texture={texture} x={x} y={y} />;
      })}
    </Container>
  );
};
