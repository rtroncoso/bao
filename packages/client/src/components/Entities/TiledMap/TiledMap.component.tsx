import React from 'react';
import { Container } from '@inlet/react-pixi';

import TMX_MAP from '../../../../../assets/public/maps/34.json';
import {
  TILES_LAYER,
  DETAILS_LAYER,
  ENTITIES_LAYER,
  Tiled,
} from '@bao/core';
import { useMapContext } from '@bao/client/components/Systems';
import { Water } from './Water';
import {
  useMapData,
  useSpriteCache,
  useTextures,
  useRenderTargets,
  useTriggerHandling,
  useViewportRendering,
} from './hooks';

export const TiledMap: React.FC = () => {
  // Extract map data from TMX
  const mapData = useMapData(TMX_MAP as unknown as Tiled);
  
  // Get map state for layer management
  const { mapState } = useMapContext();
  
  // Load textures
  const textures = useTextures();
  
  // Setup render targets
  const renderTargets = useRenderTargets();
  
  // Setup sprite caching
  const { objectsCache, spritesCache } = useSpriteCache(
    mapData.objects,
    mapData.sprites,
    mapData.tmx
  );
  
  // Handle trigger interactions
  useTriggerHandling(mapData.triggers, renderTargets.spritesLayer);
  
  // Handle viewport rendering
  useViewportRendering(
    mapData,
    objectsCache,
    spritesCache,
    textures,
    renderTargets
  );

  return (
    <>
      <Water />
      <Container ref={renderTargets.container}>
        <Container
          ref={renderTargets.tilesLayer}
          parentGroup={mapState?.groups[TILES_LAYER]}
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
    </>
  );
};
