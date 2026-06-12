import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useTick } from '@inlet/react-pixi';
import { useSelector } from 'react-redux';
import {
  Rectangle,
  Container as PixiContainer,
  AnimatedSprite,
  Sprite,
  Texture
} from 'pixi.js';
import { pointPolygon } from 'intersects';
import {
  TILE_SIZE,
  getProperty,
  getTileSetTextures,
  getTileLayersFromTmx,
  getObjectLayersFromTmx,
  getObjectsFromObjectLayers,
  getSpritesFromObjectLayers,
  getTriggersFromObjectLayers,
  getWaterFromObjectLayers,
  calculateProjectionMatrix,
  SHORE_LAYER,
  TILES_LAYER,
  TmxObject,
  TRIGGER_ROOF
} from '@bao/core';
import {
  selectAnimations,
  selectGraphics,
  selectManifest
} from '@bao/client/queries';
import { useGameContext } from '@bao/client/components/Game';
import {
  useAssetsContext,
  useMapContext,
  useViewportContext
} from '@bao/client/components/Systems';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';
import { polygon } from '@bao/client/utils';
import { SpatialIndexes, SpritesCache, TiledMapData } from './types';
import {
  POOL_SIZES,
  COLLISION_CONFIG,
  SPATIAL_CELL_SIZE_TILES,
  TILE_CHUNK_SIZE_TILES,
  TILE_CHUNK_CACHE_MARGIN,
  TILE_CULLING_TILES,
  OBJECT_CULLING_TILES,
  SHORE_SPRITE_EXTRA_CULL_PX,
  SHORE_TILE_LAYER_INDEX,
  TMX_SHORE_SPRITE_LAYER
} from './constants';
import {
  createSpritePool,
  createAnimationPool,
  generateObjectsCache,
  getObjectRenderBounds,
  ensureShoreSpritesInViewport,
  getObjectsInViewport,
  renderTileLayers,
  renderToTarget,
  renderSpriteLayers,
  getTriggerFromLayer,
  handleRoofTrigger
} from './utils';
import { SpatialHashGrid, TileChunkCache } from './spatial';
import { spatialDebugRef, offsetBounds } from './spatialDebug';
import {
  disposeShoreBucketsForMap,
  getShoreOrientations,
  ShoreEdges,
  useShoreSpriteFilters as useShoreSpriteFilterPool
} from './Shore';

export { useShoreSpriteFilters } from './Shore';

const hasTileTextures = (textures: Texture[]): boolean => {
  if (!textures.length) {
    return false;
  }

  for (let index = 1; index < textures.length; index++) {
    if (textures[index]) {
      return true;
    }
  }

  return false;
};

export const useMapData = (tmxMap: any): TiledMapData => {
  return useMemo(() => {
    const tmx = tmxMap;
    const tileLayers = getTileLayersFromTmx(tmx);
    const objectLayers = getObjectLayersFromTmx(tmx);
    const sprites = getSpritesFromObjectLayers(objectLayers);
    const objects = getObjectsFromObjectLayers(objectLayers);
    const water = getWaterFromObjectLayers(objectLayers);
    const triggers = getTriggersFromObjectLayers(objectLayers);

    return {
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

export const useSpatialIndexes = (
  mapData: TiledMapData
): SpatialIndexes | null => {
  return useMemo(() => {
    if (!mapData.tmx?.width) {
      return null;
    }

    const mapWidthPx = mapData.tmx.width * TILE_SIZE;
    const cellSize = SPATIAL_CELL_SIZE_TILES * TILE_SIZE;

    const resolveId = (object: TmxObject) => object.id;

    return {
      sprites: SpatialHashGrid.fromItems(
        mapData.sprites,
        cellSize,
        mapWidthPx,
        getObjectRenderBounds,
        resolveId
      ),
      objects: SpatialHashGrid.fromItems(
        mapData.objects,
        cellSize,
        mapWidthPx,
        getObjectRenderBounds,
        resolveId
      )
    };
  }, [mapData.objects, mapData.sprites, mapData.tmx]);
};

export const useSpritePools = () => {
  const animationsPool = useMemo(
    () => createAnimationPool(POOL_SIZES.ANIMATIONS),
    []
  );

  const spritesPool = useMemo(() => createSpritePool(POOL_SIZES.SPRITES), []);

  return { animationsPool, spritesPool };
};

export const useSpriteCache = (
  objects: TmxObject[],
  sprites: TmxObject[],
  tmx: any,
  textures: Texture[] = []
) => {
  const graphics = useSelector(selectGraphics);
  const { mapState } = useMapContext();
  const { animationsPool, spritesPool } = useSpritePools();

  const [objectsCache, setObjectsCache] = useState<SpritesCache>({});
  const [spritesCache, setSpritesCache] = useState<SpritesCache>({});

  useEffect(() => {
    if (graphics && mapState) {
      setSpritesCache(
        generateObjectsCache(
          sprites,
          graphics,
          mapState,
          animationsPool,
          spritesPool,
          textures
        )
      );
      setObjectsCache(
        generateObjectsCache(
          objects,
          graphics,
          mapState,
          animationsPool,
          spritesPool,
          textures
        )
      );
    }
  }, [
    tmx,
    graphics,
    mapState,
    objects,
    sprites,
    animationsPool,
    spritesPool,
    textures
  ]);

  return { objectsCache, spritesCache };
};

export const useTextures = () => {
  const { loader } = useAssetsContext();

  return useMemo(() => {
    if (loader && !loader.loading && Object.keys(loader.resources).length > 0) {
      return getTileSetTextures(
        loader.resources,
        'tilesets',
        `${process.env.NEXT_PUBLIC_BAO_ASSETS}/textures/tilesets`
      );
    }
    return [];
  }, [loader, loader?.loading, loader?.progress]);
};

export const useRenderTargets = () => {
  const container = useRef<PixiContainer>();
  const tilesLayer = useRef<PixiContainer>();
  const shoreLayer = useRef<PixiContainer>();
  const spritesLayer = useRef<PixiContainer>();
  const objectsLayer = useRef<PixiContainer>();

  return useMemo(
    () => ({
      container,
      tilesLayer,
      shoreLayer,
      spritesLayer,
      objectsLayer
    }),
    []
  );
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
      if (
        pointPolygon(
          x,
          y,
          polygon(trigger.polygon),
          COLLISION_CONFIG.TRIGGER_TOLERANCE
        )
      ) {
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
    handleTrigger
  };
};

export const useShoreOrientations = (mapData: TiledMapData) => {
  return useMemo(
    () => getShoreOrientations(mapData.sprites, mapData.water ?? []),
    [mapData.sprites, mapData.water]
  );
};

export interface ViewportRenderingOptions {
  mapId?: number;
  mapWorldOffset?: { x: number; y: number };
  terrainOnly?: boolean;
  publishDebug?: boolean;
}

export const useViewportRendering = (
  mapData: TiledMapData,
  spatialIndexes: SpatialIndexes | null,
  objectsCache: SpritesCache,
  spritesCache: SpritesCache,
  textures: any[],
  renderTargets: any,
  getShoreSpriteFilter: ReturnType<typeof useShoreSpriteFilterPool> | null,
  shoreOrientations: Map<string | number, ShoreEdges> | null,
  options: ViewportRenderingOptions = {}
) => {
  const mapWorldOffset = options.mapWorldOffset ?? { x: 0, y: 0 };
  const mapId = options.mapId ?? 0;
  const terrainOnly = options.terrainOnly ?? false;
  const publishDebug = options.publishDebug ?? false;
  const { projectionRef } = useViewportContext();
  const { state: gameState } = useGameContext();
  const liveCharacter = resolveLocalCharacter(
    gameState?.serverState,
    gameState?.characterId,
    gameState?.room?.sessionId
  );
  const liveCharacterRef = useRef(liveCharacter);
  liveCharacterRef.current = liveCharacter;
  const liveMapId = liveCharacter?.mapId;
  const liveTileX = liveCharacter?.tile.x;
  const liveTileY = liveCharacter?.tile.y;
  const { mapState } = useMapContext();
  const tileCullingPx = TILE_CULLING_TILES * TILE_SIZE;
  const objectCullingPx = OBJECT_CULLING_TILES * TILE_SIZE;
  const tileChunkCache = useRef(new TileChunkCache());
  const lastCullRef = useRef<{ x: number; y: number } | null>(null);
  const shoreSpriteObjects = useMemo(
    () =>
      mapData.sprites.filter(
        (sprite) =>
          Number(getProperty(sprite, 'layer')) === TMX_SHORE_SPRITE_LAYER
      ),
    [mapData.sprites]
  );

  const toLocalProjection = useCallback(
    (projection: Rectangle) =>
      new Rectangle(
        projection.x - mapWorldOffset.x,
        projection.y - mapWorldOffset.y,
        projection.width,
        projection.height
      ),
    [mapWorldOffset.x, mapWorldOffset.y]
  );

  const syncViewportLayers = useCallback(
    (projection: Rectangle) => {
      if (!hasTileTextures(textures) || !spatialIndexes) {
        return;
      }

      const tilesGroup = mapState?.groups[TILES_LAYER];
      const localProjection = toLocalProjection(projection);
      const tileBounds = calculateProjectionMatrix(
        mapData.tmx,
        localProjection,
        tileCullingPx
      );
      const objectBounds = calculateProjectionMatrix(
        mapData.tmx,
        localProjection,
        objectCullingPx
      );
      const spriteBounds = calculateProjectionMatrix(
        mapData.tmx,
        localProjection,
        objectCullingPx + SHORE_SPRITE_EXTRA_CULL_PX
      );

      const spritesInViewport = ensureShoreSpritesInViewport(
        getObjectsInViewport(spatialIndexes.sprites, spriteBounds),
        shoreSpriteObjects,
        spriteBounds
      );
      const objectsInViewport = getObjectsInViewport(
        spatialIndexes.objects,
        objectBounds
      );
      const tiles = tileChunkCache.current.getVisibleTilemaps(
        mapData.tileLayers,
        tileBounds,
        textures,
        mapData.tmx,
        TILE_CHUNK_SIZE_TILES,
        tilesGroup
      );

      renderTileLayers(
        tiles,
        {
          tilesLayer: renderTargets.tilesLayer,
          shoreLayer: renderTargets.shoreLayer
        },
        SHORE_TILE_LAYER_INDEX,
        tilesGroup
      );

      if (!terrainOnly && getShoreSpriteFilter && shoreOrientations) {
        renderSpriteLayers(
          spritesInViewport,
          renderTargets.spritesLayer,
          spritesCache,
          {
            mapId,
            getShoreSpriteFilter,
            shoreGroup: mapState?.groups[SHORE_LAYER],
            shoreOrientations,
            shoreTarget: renderTargets.shoreLayer
          }
        );

        renderSpriteLayers(
          objectsInViewport,
          renderTargets.objectsLayer,
          objectsCache
        );
      }

      tileChunkCache.current.evictOutside(
        tileBounds,
        mapData.tileLayers.length,
        TILE_CHUNK_SIZE_TILES,
        TILE_CHUNK_CACHE_MARGIN
      );

      if (publishDebug) {
        const character = liveCharacterRef.current;
        spatialDebugRef.current = {
          mapId,
          tmx: mapData.tmx,
          tileCullingPx,
          objectCullingPx,
          cullProjection: projection,
          mapWorldOffset,
          characterPosition: character
            ? {
                mapId: character.mapId,
                x: character.tile.x,
                y: character.tile.y,
                worldX: character.worldX,
                worldY: character.worldY
              }
            : undefined,
          tileBounds: offsetBounds(
            tileBounds,
            mapWorldOffset.x,
            mapWorldOffset.y
          ),
          spriteBounds: offsetBounds(
            spriteBounds,
            mapWorldOffset.x,
            mapWorldOffset.y
          ),
          objectBounds: offsetBounds(
            objectBounds,
            mapWorldOffset.x,
            mapWorldOffset.y
          ),
          cellSize: SPATIAL_CELL_SIZE_TILES * TILE_SIZE,
          spriteQueryCount: Object.values(spritesInViewport).flat().length,
          objectQueryCount: Object.values(objectsInViewport).flat().length
        };
      }
    },
    [
      mapData,
      spatialIndexes,
      objectsCache,
      spritesCache,
      textures,
      renderTargets,
      mapState,
      getShoreSpriteFilter,
      shoreOrientations,
      tileCullingPx,
      objectCullingPx,
      shoreSpriteObjects,
      toLocalProjection,
      terrainOnly,
      publishDebug,
      mapWorldOffset.x,
      mapWorldOffset.y,
      mapId
    ]
  );

  useEffect(() => {
    return () => {
      tileChunkCache.current.clear();
      disposeShoreBucketsForMap(mapId);
      if (spatialDebugRef.current?.mapId === mapId) {
        spatialDebugRef.current = null;
      }
    };
  }, [mapData.tmx, textures, mapId]);

  const publishMinimalDebugSnapshot = useCallback(() => {
    const character = liveCharacterRef.current;
    if (!publishDebug || !character) {
      return;
    }

    const projection = projectionRef.current;
    const localProjection = toLocalProjection(projection);
    const tileBounds = calculateProjectionMatrix(
      mapData.tmx,
      localProjection,
      tileCullingPx
    );
    const objectBounds = calculateProjectionMatrix(
      mapData.tmx,
      localProjection,
      objectCullingPx
    );
    const spriteBounds = calculateProjectionMatrix(
      mapData.tmx,
      localProjection,
      objectCullingPx + SHORE_SPRITE_EXTRA_CULL_PX
    );

    spatialDebugRef.current = {
      mapId,
      tmx: mapData.tmx,
      tileCullingPx,
      objectCullingPx,
      cullProjection: projection,
      mapWorldOffset,
      characterPosition: {
        mapId: character.mapId,
        x: character.tile.x,
        y: character.tile.y,
        worldX: character.worldX,
        worldY: character.worldY
      },
      tileBounds: offsetBounds(tileBounds, mapWorldOffset.x, mapWorldOffset.y),
      spriteBounds: offsetBounds(
        spriteBounds,
        mapWorldOffset.x,
        mapWorldOffset.y
      ),
      objectBounds: offsetBounds(
        objectBounds,
        mapWorldOffset.x,
        mapWorldOffset.y
      ),
      cellSize: SPATIAL_CELL_SIZE_TILES * TILE_SIZE,
      spriteQueryCount:
        spatialDebugRef.current?.mapId === mapId
          ? spatialDebugRef.current.spriteQueryCount
          : 0,
      objectQueryCount:
        spatialDebugRef.current?.mapId === mapId
          ? spatialDebugRef.current.objectQueryCount
          : 0
    };
  }, [
    mapData.tmx,
    mapId,
    mapWorldOffset.x,
    mapWorldOffset.y,
    objectCullingPx,
    projectionRef,
    publishDebug,
    tileCullingPx,
    toLocalProjection
  ]);

  useEffect(() => {
    lastCullRef.current = null;
    if (!hasTileTextures(textures) || !spatialIndexes) {
      return;
    }

    const { x, y, width, height } = projectionRef.current;
    syncViewportLayers(new Rectangle(x, y, width, height));
    lastCullRef.current = { x, y };
  }, [
    textures,
    spatialIndexes,
    mapWorldOffset.x,
    mapWorldOffset.y,
    mapData.tmx,
    liveMapId,
    syncViewportLayers,
    projectionRef
  ]);

  useEffect(() => {
    if (!publishDebug) {
      if (spatialDebugRef.current?.mapId === mapId) {
        spatialDebugRef.current = null;
      }
      return;
    }

    publishMinimalDebugSnapshot();
  }, [
    liveMapId,
    liveTileX,
    liveTileY,
    mapId,
    publishDebug,
    publishMinimalDebugSnapshot
  ]);

  useTick(() => {
    if (!hasTileTextures(textures) || !spatialIndexes) {
      return;
    }

    const { x, y, width, height } = projectionRef.current;
    const last = lastCullRef.current;
    if (last && Math.abs(x - last.x) < 8 && Math.abs(y - last.y) < 8) {
      return;
    }

    lastCullRef.current = { x, y };
    syncViewportLayers(new Rectangle(x, y, width, height));
  });
};
