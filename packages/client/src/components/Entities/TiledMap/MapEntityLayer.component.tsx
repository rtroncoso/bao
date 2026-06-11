import React, { useMemo } from 'react';
import { Container, Sprite } from '@inlet/react-pixi';
import { useSelector } from 'react-redux';

import { getTexture, Graphic, tileCoordsToScreen, TILE_SIZE } from '@bao/core';
import { Animation } from '@bao/client/components/Pixi';
import { useGameContext } from '@bao/client/components/Game/Game.context';
import { useMapContext } from '@bao/client/components/Systems';
import { selectGraphics } from '@bao/client/queries';
import { State } from '@bao/client/store';

import { ENTITIES_LAYER } from '@bao/core/constants/game/Map';
import { DOOR, isServerRenderedObject } from '@bao/core/constants/game/Object';
import { MapNpcEntity } from './MapNpcEntity.component';
import { useMapInteractionContext } from '@bao/client/components/Systems/MapInteractionSystem';

const hasAnimationFrames = (graphic: Graphic) =>
  Array.isArray(graphic.frames) && graphic.frames.length > 0;

export interface MapEntityLayerProps {
  mapId: number;
}

export const MapEntityLayer: React.FC<MapEntityLayerProps> = ({ mapId }) => {
  const graphics = useSelector((state: State) => selectGraphics(state));
  const { mapState } = useMapContext();
  const { state: gameState } = useGameContext();
  const { onNpcClick, onObjectClick, isPlayerAdjacentTo } =
    useMapInteractionContext();

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
        if (isServerRenderedObject(entity.objectType)) {
          objectList.push(entity);
        }
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
          description={entity.description}
          x={entity.x}
          y={entity.y}
          onClick={() => onNpcClick(entity.id, entity.description)}
        />
      ))}
      {objects.map((entity) => {
        const graphic = graphics?.[entity.graphicId];
        if (!graphic) {
          return null;
        }

        const { x, y } = tileCoordsToScreen(entity.x, entity.y, graphic);
        const isDoor = entity.objectType === DOOR;
        const canInteract = isDoor && isPlayerAdjacentTo(entity.x, entity.y);

        const handlePointerDown = () => {
          if (isDoor && canInteract) {
            onObjectClick(entity.id, entity.x, entity.y, DOOR);
          }
        };

        if (hasAnimationFrames(graphic)) {
          return (
            <Container
              key={entity.id}
              x={x}
              y={y}
              interactive={isDoor}
              pointerdown={handlePointerDown}
            >
              <Animation animation={graphic} x={0} y={0} />
            </Container>
          );
        }

        const texture = getTexture(graphic);
        if (!texture) {
          return null;
        }

        return (
          <Sprite
            key={entity.id}
            texture={texture}
            x={x}
            y={y}
            interactive={isDoor}
            pointerdown={handlePointerDown}
          />
        );
      })}
    </Container>
  );
};
