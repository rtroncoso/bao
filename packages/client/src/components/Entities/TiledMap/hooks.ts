import { useMemo, useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Rectangle, Point, Container as PixiContainer, AnimatedSprite, Sprite } from 'pixi.js';
import { pointPolygon } from 'intersects';
import { useApp } from '@inlet/react-pixi';

import {
  PRELOAD,
  TILE_SIZE,
  getTileSetTextures,
  getTileLayersFromTmx,
  getObjectLayersFromTmx,
  getCollisionsFromObjectLayers,
  getObjectsFromObjectLayers,
  getSpritesFromObjectLayers,
  getTriggersFromObjectLayers,
  getWaterFromObjectLayers,
  calculateProjectionMatrix,
  TmxObject,
  TRIGGER_ROOF,
} from '@bao/core';
import {
  selectAnimations,
  selectGraphics,
  selectManifest
} from '@bao/client/queries';
import {
  useMapContext,
  useViewportContext
} from '@bao/client/components/Systems';
import { polygon } from '@bao/client/utils';

import { SpritesCache, TiledMapData } from './types';
import { POOL_SIZES, COLLISION_CONFIG } from './constants';
import {
  createSpritePool,
  createAnimationPool,
  generateObjectsCache,
  getObjectsInViewport,
  generateTileLayers,
  renderToTarget,
  renderSpriteLayers,
  getTriggerFromLayer,
  handleRoofTrigger,
} from './utils';

export const useMapData = (tmxMap: any): TiledMapData => {
  return useMemo(() => {
    const tmx = tmxMap;
    const tileLayers = getTileLayersFromTmx(tmx);
    const objectLayers = getObjectLayersFromTmx(tmx);
    const sprites = getSpritesFromObjectLayers(objectLayers);
    const objects = getObjectsFromObjectLayers(objectLayers);
    const water = getWaterFromObjectLayers(objectLayers);
    const collisions = getCollisionsFromObjectLayers(objectLayers);
    const triggers = getTriggersFromObjectLayers(objectLayers);

    return {
      collisions,
      objectLayers,
      objects,
      sprites,
      tileLayers,
      tmx,
      triggers,
      water
    };
  }, [tmxMap]);
};

export const useSpritePools = () => {
  const animationsPool = useMemo(() => 
    createAnimationPool(POOL_SIZES.ANIMATIONS), []
  );
  
  const spritesPool = useMemo(() => 
    createSpritePool(POOL_SIZES.SPRITES), []
  );

  return { animationsPool, spritesPool };
};

export const useSpriteCache = (
  objects: TmxObject[],
  sprites: TmxObject[],
  tmx: any
) => {
  const graphics = useSelector(selectGraphics);
  const { mapState } = useMapContext();
  const { animationsPool, spritesPool } = useSpritePools();
  
  const [objectsCache, setObjectsCache] = useState<SpritesCache>({});
  const [spritesCache, setSpritesCache] = useState<SpritesCache>({});

  useEffect(() => {
    if (graphics && mapState) {
      setSpritesCache(generateObjectsCache(sprites, graphics, mapState, animationsPool, spritesPool));
      setObjectsCache(generateObjectsCache(objects, graphics, mapState, animationsPool, spritesPool));
    }
  }, [tmx, graphics, mapState, objects, sprites, animationsPool, spritesPool]);

  return { objectsCache, spritesCache };
};

export const useTextures = () => {
  const { loader } = useApp();
  
  return useMemo(() => {
    if (!loader.loading) {
      return getTileSetTextures(
        loader.resources,
        'tilesets',
        `${process.env.NEXT_PUBLIC_BAO_ASSETS}/textures/tilesets`
      );
    }
    return [];
  }, [loader.loading, loader.resources]);
};

export const useRenderTargets = () => {
  const container = useRef<PixiContainer>();
  const tilesLayer = useRef<PixiContainer>();
  const spritesLayer = useRef<PixiContainer>();
  const objectsLayer = useRef<PixiContainer>();

  return {
    container,
    tilesLayer,
    spritesLayer,
    objectsLayer,
  };
};

export const useTriggerHandling = (
  triggers: TmxObject[],
  spritesLayer: React.RefObject<PixiContainer>
) => {
  const { viewportState } = useViewportContext();
  const [currentTrigger, setCurrentTrigger] = useState<TmxObject>();

  const hasTrigger = (trigger: number) => {
    const number = getTriggerFromLayer(currentTrigger);
    return number ? trigger === number : false;
  };

  const setTrigger = (trigger: TmxObject) => {
    setCurrentTrigger(trigger);
    handleTrigger(trigger);
  };

  const handleTrigger = (trigger: TmxObject) => {
    if (!spritesLayer.current) return;
    
    const number = getTriggerFromLayer(trigger);
    const { hideRoofs, showRoofs } = handleRoofTrigger(
      trigger, 
      number, 
      spritesLayer.current.children
    );

    switch (number) {
      case TRIGGER_ROOF:
        hideRoofs();
        break;
      default:
        showRoofs();
        break;
    }
  };

  useEffect(() => {
    let triggered = false;
    const tile = viewportState.currentCharacter?.tile;
    const x = tile?.x * TILE_SIZE + TILE_SIZE / 2;
    const y = tile?.y * TILE_SIZE + TILE_SIZE / 2;

    triggers.forEach((trigger) => {
      if (pointPolygon(x, y, polygon(trigger.polygon), COLLISION_CONFIG.TRIGGER_TOLERANCE)) {
        const number = getTriggerFromLayer(trigger);
        if (!hasTrigger(number)) setTrigger(trigger);
        triggered = true;
      }
    });

    if (!triggered && currentTrigger) {
      setTrigger(null);
    }
  }, [
    triggers,
    viewportState.currentCharacter?.tile.x,
    viewportState.currentCharacter?.tile.y
  ]);

  return {
    currentTrigger,
    hasTrigger,
    setTrigger,
    handleTrigger,
  };
};

export const useViewportRendering = (
  mapData: TiledMapData,
  objectsCache: SpritesCache,
  spritesCache: SpritesCache,
  textures: any[],
  renderTargets: any
) => {
  const { viewportState } = useViewportContext();
  const preload = PRELOAD * TILE_SIZE;

  useEffect(() => {
    const x = Math.floor(viewportState.projection.x / TILE_SIZE);
    const y = Math.floor(viewportState.projection.y / TILE_SIZE);
    const projection = new Rectangle(
      viewportState.projection.x,
      viewportState.projection.y,
      viewportState.projection.width,
      viewportState.projection.height
    );
    const chunk = new Point(x, y);
    const bounds = calculateProjectionMatrix(mapData.tmx, projection, preload);

    const spritesInViewport = getObjectsInViewport(mapData.sprites, chunk, bounds, mapData.tmx);
    const objectsInViewport = getObjectsInViewport(mapData.objects, chunk, bounds, mapData.tmx);
    const tiles = generateTileLayers(mapData.tileLayers, bounds, textures, mapData.tmx);

    renderToTarget(tiles, renderTargets.tilesLayer);
    renderSpriteLayers(spritesInViewport, renderTargets.spritesLayer, spritesCache);
    renderSpriteLayers(objectsInViewport, renderTargets.objectsLayer, objectsCache);
  }, [
    viewportState.currentCharacter?.tile.x,
    viewportState.currentCharacter?.tile.y,
    mapData,
    objectsCache,
    spritesCache,
    textures,
    renderTargets
  ]);
};