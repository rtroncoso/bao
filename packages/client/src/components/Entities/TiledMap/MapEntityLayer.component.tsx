import React, { useMemo } from 'react';
import { Container, Sprite } from '@inlet/react-pixi';
import { Rectangle } from 'pixi.js';
import { useSelector } from 'react-redux';

import { getTexture, Graphic, tileCoordsToScreen, TILE_SIZE } from '@bao/core';
import { Animation } from '@bao/client/components/Pixi';
import { useGameContext } from '@bao/client/components/Game/Game.context';
import {
  useMapContext,
  useViewportContext
} from '@bao/client/components/Systems';
import { selectGraphics } from '@bao/client/queries';
import { State } from '@bao/client/store';

import { ENTITIES_LAYER } from '@bao/core/constants/game/Map';
import { DOOR, isServerRenderedObject } from '@bao/core/constants/game/Object';
import { MapNpcEntity } from './MapNpcEntity.component';
import { useMapInteractionContext } from '@bao/client/components/Systems/MapInteractionSystem';

const ENTITY_VIEWPORT_PADDING = TILE_SIZE * 2;

const hasAnimationFrames = (graphic: Graphic) =>
  Array.isArray(graphic.frames) && graphic.frames.length > 0;

const intersectsViewport = (
  x: number,
  y: number,
  width: number,
  height: number,
  viewport: Rectangle,
  mapOffsetX: number,
  mapOffsetY: number
) => {
  const worldX = mapOffsetX + x;
  const worldY = mapOffsetY + y;

  return (
    worldX + width >= viewport.x - ENTITY_VIEWPORT_PADDING &&
    worldX <= viewport.x + viewport.width + ENTITY_VIEWPORT_PADDING &&
    worldY + height >= viewport.y - ENTITY_VIEWPORT_PADDING &&
    worldY <= viewport.y + viewport.height + ENTITY_VIEWPORT_PADDING
  );
};

export interface MapEntityLayerProps {
  mapId: number;
  mapWorldOffset?: { x: number; y: number };
}

export const MapEntityLayer: React.FC<MapEntityLayerProps> = ({
  mapId,
  mapWorldOffset = { x: 0, y: 0 }
}) => {
  const graphics = useSelector((state: State) => selectGraphics(state));
  const { mapState } = useMapContext();
  const { state: gameState } = useGameContext();
  const { viewportState } = useViewportContext();
  const { onNpcClick, onObjectClick, isPlayerAdjacentTo } =
    useMapInteractionContext();

  const viewport = viewportState.projection;

  const currentMap = gameState?.serverState?.maps?.get(String(mapId));

  const npcs = useMemo(() => {
    if (!currentMap?.npcs || !viewport) {
      return currentMap?.npcs ? [...currentMap.npcs] : [];
    }

    return [...currentMap.npcs].filter((entity) =>
      intersectsViewport(
        entity.x * TILE_SIZE,
        entity.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        viewport,
        mapWorldOffset.x,
        mapWorldOffset.y
      )
    );
  }, [
    currentMap?.npcs,
    viewport.x,
    viewport.y,
    viewport.width,
    viewport.height,
    mapWorldOffset.x,
    mapWorldOffset.y
  ]);

  const objects = useMemo(() => {
    if (!currentMap?.objects) {
      return [];
    }

    const serverObjects = currentMap.objects.filter((entity) =>
      isServerRenderedObject(entity.objectType)
    );

    if (!viewport) {
      return serverObjects;
    }

    return serverObjects.filter((entity) => {
      const graphic = graphics?.[entity.graphicId];
      const width = graphic?.width ?? TILE_SIZE;
      const height = graphic?.height ?? TILE_SIZE;
      const { x, y } = tileCoordsToScreen(entity.x, entity.y, graphic);

      return intersectsViewport(
        x,
        y,
        width,
        height,
        viewport,
        mapWorldOffset.x,
        mapWorldOffset.y
      );
    });
  }, [
    currentMap?.objects,
    graphics,
    viewport.x,
    viewport.y,
    viewport.width,
    viewport.height,
    mapWorldOffset.x,
    mapWorldOffset.y
  ]);

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
