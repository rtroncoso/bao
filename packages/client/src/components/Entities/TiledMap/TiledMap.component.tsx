import React, { useMemo } from 'react';
import { Container } from '@inlet/react-pixi';

import {
  TILES_LAYER,
  SHORE_LAYER,
  DETAILS_LAYER,
  ENTITIES_LAYER,
  Tiled
} from '@bao/core';
import { useMapContext, useWorldContext } from '@bao/client/components/Systems';
import { Water } from './Water';
import { EffectsAnimationSystem, useShoreSpriteFilters } from './Shore';
import { MapEntityLayer } from './MapEntityLayer.component';
import {
  useMapData,
  useSpatialIndexes,
  useShoreOrientations,
  useSpriteCache,
  useTextures,
  useRenderTargets,
  useTriggerHandling,
  useViewportRendering
} from './hooks';
import { useBorderPrefetch } from './useBorderPrefetch';

interface TiledMapContentProps {
  mapId: number;
  currentMap: Tiled;
  worldOffsetX: number;
  worldOffsetY: number;
  isCurrentMap?: boolean;
}

const TiledMapMapContent: React.FC<TiledMapContentProps> = ({
  mapId,
  currentMap,
  worldOffsetX,
  worldOffsetY,
  isCurrentMap = false
}) => {
  const mapData = useMapData(currentMap);
  const spatialIndexes = useSpatialIndexes(mapData);
  const { mapState } = useMapContext();
  const textures = useTextures();
  const renderTargets = useRenderTargets();
  const getShoreSpriteFilter = useShoreSpriteFilters(mapId);
  const shoreOrientations = useShoreOrientations(mapData);
  const mapWorldOffset = useMemo(
    () => ({ x: worldOffsetX, y: worldOffsetY }),
    [worldOffsetX, worldOffsetY]
  );

  const { objectsCache, spritesCache } = useSpriteCache(
    mapData.objects,
    mapData.sprites,
    mapData.tmx,
    textures
  );

  useTriggerHandling(
    isCurrentMap ? mapData.triggers : [],
    renderTargets.spritesLayer
  );

  useViewportRendering(
    mapData,
    spatialIndexes,
    objectsCache,
    spritesCache,
    textures,
    renderTargets,
    getShoreSpriteFilter,
    shoreOrientations,
    { mapId, mapWorldOffset, publishDebug: isCurrentMap }
  );

  return (
    <>
      <Water water={mapData.water} mapWorldOffset={mapWorldOffset} />
      <Container ref={renderTargets.container}>
        <Container
          ref={renderTargets.tilesLayer}
          parentGroup={mapState?.groups[TILES_LAYER]}
        />
        <Container
          ref={renderTargets.shoreLayer}
          parentGroup={mapState?.groups[SHORE_LAYER]}
        />
        <Container
          ref={renderTargets.spritesLayer}
          parentGroup={mapState?.groups[DETAILS_LAYER]}
        />
        <Container
          ref={renderTargets.objectsLayer}
          parentGroup={mapState?.groups[ENTITIES_LAYER]}
        />
        <MapEntityLayer mapId={mapId} mapWorldOffset={mapWorldOffset} />
      </Container>
    </>
  );
};

export const TiledMap: React.FC = () => {
  const { activeMaps, currentMapId, isLoading } = useWorldContext();

  useBorderPrefetch();

  if (isLoading && activeMaps.length === 0) {
    return null;
  }

  if (activeMaps.length === 0) {
    return null;
  }

  return (
    <EffectsAnimationSystem>
      {activeMaps.map(({ mapId, map, offsetX, offsetY }) => (
        <Container key={mapId} x={offsetX} y={offsetY}>
          <TiledMapMapContent
            mapId={mapId}
            currentMap={map}
            worldOffsetX={offsetX}
            worldOffsetY={offsetY}
            isCurrentMap={mapId === currentMapId}
          />
        </Container>
      ))}
    </EffectsAnimationSystem>
  );
};
