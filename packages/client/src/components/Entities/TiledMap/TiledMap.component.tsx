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
import { ViewportCullingSystem } from './ViewportCullingSystem';

interface TiledMapContentProps {
  mapId: number;
  currentMap: Tiled;
  worldOffsetX: number;
  worldOffsetY: number;
  isCurrentMap: boolean;
  publishDebug?: boolean;
}

const TiledMapMapContent: React.FC<TiledMapContentProps> = ({
  mapId,
  currentMap,
  worldOffsetX,
  worldOffsetY,
  isCurrentMap,
  publishDebug = false
}) => {
  const borderOnly = !isCurrentMap;
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
    publishDebug ? mapData.triggers : [],
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
    { mapId, mapWorldOffset, borderOnly, publishDebug }
  );

  return (
    <>
      {isCurrentMap ? (
        <Water water={mapData.water} mapWorldOffset={mapWorldOffset} />
      ) : null}
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
        {isCurrentMap ? (
          <MapEntityLayer mapId={mapId} mapWorldOffset={mapWorldOffset} />
        ) : (
          <MapEntityLayer
            mapId={mapId}
            mapWorldOffset={mapWorldOffset}
            borderOnly
          />
        )}
      </Container>
    </>
  );
};

export const TiledMap: React.FC = () => {
  const { activeMaps, currentMapId, isLoading } = useWorldContext();
  const debugMapId = currentMapId;

  useBorderPrefetch();

  if (isLoading && activeMaps.length === 0) {
    return null;
  }

  if (activeMaps.length === 0) {
    return null;
  }

  return (
    <EffectsAnimationSystem>
      <ViewportCullingSystem />
      {activeMaps.map(({ mapId, map, offsetX, offsetY }) => (
        <Container key={mapId} x={offsetX} y={offsetY}>
          <TiledMapMapContent
            mapId={mapId}
            currentMap={map}
            worldOffsetX={offsetX}
            worldOffsetY={offsetY}
            isCurrentMap={mapId === currentMapId}
            publishDebug={mapId === debugMapId}
          />
        </Container>
      ))}
    </EffectsAnimationSystem>
  );
};
