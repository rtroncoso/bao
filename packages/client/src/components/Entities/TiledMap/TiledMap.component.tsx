import React from 'react';
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
import { EffectsAnimationSystem } from './Shore';
import { MapEntityLayer } from './MapEntityLayer.component';
import {
  useMapData,
  useSpatialIndexes,
  useShoreOrientations,
  useShoreSpriteFilters,
  useSpriteCache,
  useTextures,
  useRenderTargets,
  useTriggerHandling,
  useViewportRendering
} from './hooks';
import { useBorderPrefetch } from './useBorderPrefetch';

const TiledMapContent: React.FC<{ currentMap: Tiled }> = ({ currentMap }) => {
  const mapData = useMapData(currentMap);
  const spatialIndexes = useSpatialIndexes(mapData);
  const { mapState } = useMapContext();
  const textures = useTextures();
  const renderTargets = useRenderTargets();
  const getShoreSpriteFilter = useShoreSpriteFilters();
  const shoreOrientations = useShoreOrientations(mapData);

  const { objectsCache, spritesCache } = useSpriteCache(
    mapData.objects,
    mapData.sprites,
    mapData.tmx
  );

  useTriggerHandling(mapData.triggers, renderTargets.spritesLayer);
  useBorderPrefetch();

  useViewportRendering(
    mapData,
    spatialIndexes,
    objectsCache,
    spritesCache,
    textures,
    renderTargets,
    getShoreSpriteFilter,
    shoreOrientations
  );

  return (
    <EffectsAnimationSystem>
      <Water water={mapData.water} />
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
        <MapEntityLayer />
      </Container>
    </EffectsAnimationSystem>
  );
};

export const TiledMap: React.FC = () => {
  const { currentMap, isLoading } = useWorldContext();

  if (isLoading || !currentMap) {
    return null;
  }

  return <TiledMapContent currentMap={currentMap} />;
};
