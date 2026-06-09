import React from 'react';
import { Container } from '@inlet/react-pixi';

import TMX_MAP from '../../../../../assets/public/maps/34.json';
import {
  TILES_LAYER,
  SHORE_LAYER,
  DETAILS_LAYER,
  ENTITIES_LAYER,
  Tiled
} from '@bao/core';
import { useMapContext } from '@bao/client/components/Systems';
import { Water } from './Water';
import { EffectsAnimationSystem } from './Shore';
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

export const TiledMap: React.FC = () => {
  const mapData = useMapData(TMX_MAP as unknown as Tiled);
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
      </Container>
    </EffectsAnimationSystem>
  );
};
