import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Container as PixiContainer,
  Rectangle,
  Point,
  AnimatedSprite,
  Sprite,
  Texture,
  DisplayObject
} from 'pixi.js';
import { boxPolygon, pointPolygon } from 'intersects';
import { CompositeTilemap } from '@pixi/tilemap';

import each from 'lodash/fp/each';
import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import groupBy from 'lodash/fp/groupBy';
import range from 'lodash/fp/range';

import TMX_MAP from '../../../../../assets/public/maps/34.json';
import MAP from '../../../../../assets/public/maps/old/Mapa34.map';
import INF from '../../../../../assets/public/maps/old/Mapa34.inf';
import DAT from '../../../../../assets/public/maps/old/Mapa34.dat';
import OBJECTS from '../../../../../assets/public/init/objects.json';

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
  Tiled,
  calculateProjectionMatrix,
  getProperty,
  getTexture,
  TmxObject,
  Graphic,
  TILES_LAYER,
  DETAILS_LAYER,
  ENTITIES_LAYER,
  TileLayer,
  TRIGGER_ROOF,
  UPPER_LAYER
} from '@bao/core';
import { Container, useApp } from '@inlet/react-pixi';
import { selectAnimations, selectGraphics, selectManifest } from 'src/queries';
import { useMapContext, useViewportContext } from 'src/components/Systems';
import { polygon } from 'src/utils';
import { Ease } from 'pixi-ease';
import { Water } from './Water';

export const ANIMATIONS_POOL_SIZE = 2000;
export const SPRITES_POOL_SIZE = 3000;
export type SpritesCache = { [key: string]: Sprite | AnimatedSprite };
const easing = new Ease({});

export const TiledMap: React.FC = () => {
  const { loader } = useApp();
  const graphics = useSelector(selectGraphics);
  const animations = useSelector(selectAnimations);
  const manifest = useSelector(selectManifest);
  const { objects, sprites, tileLayers, triggers, tmx } = useMemo(() => {
    // const legacyMap = getBinaryLayers({
    //   graphics,
    //   animations,
    //   objects: OBJECTS as any[],
    //   mapFile: MAP,
    //   datFile: DAT,
    //   infFile: INF
    // });
    // const tmx = convertLayersToTmx({
    //   layers: legacyMap,
    //   resources: loader.resources
    // });
    const tmx = TMX_MAP as unknown as Tiled;
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
  }, []);

  const { viewportState } = useViewportContext();
  const { mapState } = useMapContext();

  const [currentTrigger, setCurrentTrigger] = useState();
  const [objectsCache, setObjectsCache] = useState<SpritesCache>({});
  const [spritesCache, setSpritesCache] = useState<SpritesCache>({});

  const animationsPool = useMemo(() => {
    return range(0, ANIMATIONS_POOL_SIZE).map(
      () => new AnimatedSprite([Texture.EMPTY])
    );
  }, []);

  const spritesPool = useMemo(() => {
    return range(0, SPRITES_POOL_SIZE).map(() => new Sprite(Texture.EMPTY));
  }, []);

  const container = useRef<PixiContainer>();
  const tilesLayer = useRef<PixiContainer>();
  const spritesLayer = useRef<PixiContainer>();
  const objectsLayer = useRef<PixiContainer>();
  const preload = PRELOAD * TILE_SIZE;

  const textures = useMemo(() => {
    if (!loader.loading) {
      return getTileSetTextures(
        loader.resources,
        'tilesets',
        `${process.env.NEXT_PUBLIC_BAO_ASSETS}/textures/tilesets`
      );
    }
    return [];
  }, [loader.loading, loader.resources]);

  const generateObjectsCache = (objects: TmxObject[]): SpritesCache => {
    const cache = {};
    const objectsCache = flow(
      map<TmxObject, Sprite>(
        (object) => (cache[object.id] = getSpriteFromObject(object))
      )
    );

    objectsCache(objects);
    return cache;
  };

  const getObjectsInViewport = (
    objects: TmxObject[],
    chunk: Point,
    bounds: Rectangle
  ) => {
    const cache = {};
    const memoKey = chunk.y * tmx.width + chunk.x;

    const grabSprites = flow(
      filter<TmxObject>((object) => bounds.contains(object.x, object.y)),
      groupBy((object) => getProperty(object, 'layer')),
      mapValues<TmxObject[], string[]>((layer) => layer.map((o) => o.id))
    );

    cache[memoKey] = grabSprites(objects);
    return cache[memoKey];
  };

  const getSpriteFromPoolOrNew = (
    graphic: Graphic
  ): Sprite | AnimatedSprite => {
    if (graphic.frames.length > 0) {
      const sprite =
        animationsPool.pop() || new AnimatedSprite([Texture.EMPTY]);
      sprite.destroy = (options) => {
        animationsPool.push(sprite);
        return sprite.destroy(options);
      };
      sprite.textures = graphic.frames.map(getTexture);
      sprite.animationSpeed = graphic.speed;
      sprite.gotoAndPlay(0);
      return sprite;
    }

    const sprite = spritesPool.pop() || new Sprite(Texture.EMPTY);
    sprite.destroy = (options) => {
      spritesPool.push(sprite);
      return sprite.destroy(options);
    };
    sprite.texture = getTexture(graphic);
    return sprite;
  };

  const getSpriteFromObject = (layer: TmxObject) => {
    const x = getProperty(layer, 'x');
    const y = getProperty(layer, 'y');
    const layerNumber = getProperty(layer, 'layer');
    const graphicId = getProperty(layer, 'graphicId');

    const graphic = graphics[graphicId];
    const sprite = getSpriteFromPoolOrNew(graphic);
    sprite.position.set(x, y);
    const group = mapState.groups[layerNumber];
    if (group) sprite.parentGroup = group;
    sprite.accessibleType = `${layerNumber}`;

    return sprite;
  };

  const generateTileLayers = (
    layers: TileLayer[],
    bounds: Rectangle
  ): CompositeTilemap[] => {
    const screenBoundsX = Math.floor(bounds.x / TILE_SIZE);
    const screenBoundsY = Math.floor(bounds.y / TILE_SIZE);
    const screenBoundsWidth =
      screenBoundsX + Math.floor(bounds.width / TILE_SIZE);
    const screenBoundsHeight =
      screenBoundsY + Math.floor(bounds.height / TILE_SIZE);

    return layers.map((layer) => {
      const tileSets = getProperty(layer, 'usedTileSets');
      const tilemap = new CompositeTilemap(tileSets);
      for (let y = screenBoundsY; y < screenBoundsHeight; y++) {
        for (let x = screenBoundsX; x < screenBoundsWidth; x++) {
          const index = y * tmx.width + x;
          if (layer.data[index] > 0) {
            const texture = textures[layer.data[index]];
            tilemap.tile(texture, x * TILE_SIZE, y * TILE_SIZE);
          }
        }
      }
      return tilemap;
    });
  };

  const renderSpriteLayers = (nodes: DisplayObject[], target, cache) => {
    const spritesRenderer = each<DisplayObject[]>((node) => {
      const action = (id) => {
        const sprite = cache[id];
        return sprite;
      };

      renderToTarget(node, target, action, false);
    });

    if (target.current) target.current.removeChildren();
    return spritesRenderer(Object.values(nodes));
  };

  const renderToTarget = (
    nodes: DisplayObject[],
    target: React.RefObject<PixiContainer>,
    action = (i) => i,
    remove = true
  ) => {
    if (target.current) {
      const container = target.current;
      if (remove) target.current.removeChildren();
      nodes.forEach((node) => {
        const child = action(node);
        if (child) container.addChild(child);
      });
    }

    return nodes;
  };

  useEffect(() => {
    setSpritesCache(generateObjectsCache(sprites));
    setObjectsCache(generateObjectsCache(objects));
  }, [mapState.groups, tmx]);

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
    const bounds = calculateProjectionMatrix(tmx, projection, preload);

    const spritesInViewport = getObjectsInViewport(sprites, chunk, bounds);
    const objectsInViewport = getObjectsInViewport(objects, chunk, bounds);
    const tiles = generateTileLayers(tileLayers, bounds);

    renderToTarget(tiles, tilesLayer);
    renderSpriteLayers(spritesInViewport, spritesLayer, spritesCache);
    renderSpriteLayers(objectsInViewport, objectsLayer, objectsCache);
  }, [
    mapState,
    viewportState.currentCharacter?.tile.x,
    viewportState.currentCharacter?.tile.y
  ]);

  const getTriggerFromLayer = (trigger) => {
    return trigger ? getProperty(trigger, 'trigger') : null;
  };

  const hasTrigger = (trigger) => {
    const number = getTriggerFromLayer(trigger);
    return number ? trigger === number : false;
  };

  const setTrigger = (trigger) => {
    setCurrentTrigger(getTriggerFromLayer(trigger));
    handleTrigger(trigger);
  };

  const handleTrigger = (trigger) => {
    const number = getTriggerFromLayer(trigger);
    const hideRoofs = flow(
      filter<Sprite>(
        (sprite) =>
          sprite.accessibleType === `${UPPER_LAYER}` &&
          boxPolygon(
            sprite.position.x,
            sprite.position.y,
            sprite.width,
            sprite.height,
            polygon(trigger.polygon),
            0.1
          )
      ),
      each<Sprite>((sprite) =>
        easing.add(sprite, { alpha: 0.0 }, { duration: 500 })
      )
    );
    const showRoofs = flow(
      filter<Sprite>((sprite) => sprite.accessibleType === `${UPPER_LAYER}`),
      each<Sprite>((sprite) =>
        easing.add(sprite, { alpha: 1.0 }, { duration: 500 })
      )
    );

    switch (number) {
      case TRIGGER_ROOF:
        hideRoofs(spritesLayer.current.children);
        break;
      default:
        showRoofs(spritesLayer.current.children);
        break;
    }
  };

  useEffect(() => {
    let triggered = false;
    const tile = viewportState.currentCharacter?.tile;
    const x = tile?.x * TILE_SIZE;
    const y = tile?.y * TILE_SIZE;

    triggers.forEach((trigger) => {
      if (
        pointPolygon(
          x + TILE_SIZE / 2,
          y + TILE_SIZE / 2,
          polygon(trigger.polygon)
        )
      ) {
        if (!hasTrigger(trigger)) setTrigger(trigger);
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

  return (
    <>
      <Water />
      <Container ref={container}>
        <Container
          ref={tilesLayer}
          parentGroup={mapState?.groups[TILES_LAYER]}
        />
        <Container
          ref={spritesLayer}
          parentGroup={mapState?.groups[DETAILS_LAYER]}
        />
        <Container
          ref={objectsLayer}
          parentGroup={mapState?.groups[ENTITIES_LAYER]}
        />
      </Container>
    </>
  );
};
