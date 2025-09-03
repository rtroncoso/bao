import {
  Rectangle,
  Point,
  AnimatedSprite,
  Sprite,
  Texture,
  DisplayObject,
} from 'pixi.js';
import { CompositeTilemap } from '@pixi/tilemap';
import { boxPolygon } from 'intersects';
import { Ease } from 'pixi-ease';

import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';
import mapValues from 'lodash/fp/mapValues';
import groupBy from 'lodash/fp/groupBy';
import each from 'lodash/fp/each';

import {
  TILE_SIZE,
  getProperty,
  getTexture,
  TmxObject,
  Graphic,
  TileLayer,
  UPPER_LAYER,
} from '@bao/core';
import { polygon } from '@bao/client/utils';
import { SpritesCache } from './types';
import { ANIMATION_CONFIG, COLLISION_CONFIG } from './constants';

const easing = new Ease({});

export const createSpritePool = (size: number): Sprite[] => {
  return Array.from({ length: size }, () => new Sprite(Texture.EMPTY));
};

export const createAnimationPool = (size: number): AnimatedSprite[] => {
  return Array.from({ length: size }, () => new AnimatedSprite([Texture.EMPTY]));
};

export const getSpriteFromPoolOrNew = (
  graphic: Graphic,
  animationsPool: AnimatedSprite[],
  spritesPool: Sprite[]
): Sprite | AnimatedSprite => {
  if (graphic.frames.length > 0) {
    const sprite = animationsPool.pop() || new AnimatedSprite([Texture.EMPTY]);
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

export const createSpriteFromObject = (
  object: TmxObject,
  graphics: any,
  mapState: any,
  animationsPool: AnimatedSprite[],
  spritesPool: Sprite[]
): Sprite | AnimatedSprite => {
  const x = getProperty(object, 'x');
  const y = getProperty(object, 'y');
  const layerNumber = getProperty(object, 'layer');
  const graphicId = getProperty(object, 'graphicId');

  const graphic = graphics[graphicId];
  const sprite = getSpriteFromPoolOrNew(graphic, animationsPool, spritesPool);
  sprite.position.set(x, y);
  
  const group = mapState.groups[layerNumber];
  if (group) sprite.parentGroup = group;
  sprite.accessibleType = `${layerNumber}`;

  return sprite;
};

export const generateObjectsCache = (
  objects: TmxObject[],
  graphics: any,
  mapState: any,
  animationsPool: AnimatedSprite[],
  spritesPool: Sprite[]
): SpritesCache => {
  const cache: SpritesCache = {};
  
  objects.forEach((object) => {
    cache[object.id] = createSpriteFromObject(
      object,
      graphics,
      mapState,
      animationsPool,
      spritesPool
    );
  });

  return cache;
};

export const getObjectsInViewport = (
  objects: TmxObject[],
  chunk: Point,
  bounds: Rectangle,
  tmx: any
) => {
  const memoKey = chunk.y * tmx.width + chunk.x;

  const grabSprites = flow(
    filter<TmxObject>((object) => bounds.contains(object.x, object.y)),
    groupBy((object) => getProperty(object, 'layer')),
    mapValues<TmxObject[], string[]>((layer) => layer.map((o) => o.id))
  );

  return grabSprites(objects);
};

export const generateTileLayers = (
  layers: TileLayer[],
  bounds: Rectangle,
  textures: any[],
  tmx: any
): CompositeTilemap[] => {
  const screenBoundsX = Math.floor(bounds.x / TILE_SIZE);
  const screenBoundsY = Math.floor(bounds.y / TILE_SIZE);
  const screenBoundsWidth = screenBoundsX + Math.floor(bounds.width / TILE_SIZE);
  const screenBoundsHeight = screenBoundsY + Math.floor(bounds.height / TILE_SIZE);

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

export const renderToTarget = (
  nodes: DisplayObject[],
  target: React.RefObject<any>,
  action = (node: any) => node,
  removeChildren = true
) => {
  if (target.current) {
    const container = target.current;
    if (removeChildren) target.current.removeChildren();
    
    nodes.forEach((node) => {
      const child = action(node);
      if (child) container.addChild(child);
    });
  }

  return nodes;
};

export const renderSpriteLayers = (
  nodes: any,
  target: React.RefObject<any>,
  cache: SpritesCache
) => {
  const spritesRenderer = each<any[]>((node) => {
    const action = (id: string) => cache[id];
    return renderToTarget(node, target, action, false);
  });

  if (target.current) target.current.removeChildren();
  return spritesRenderer(Object.values(nodes));
};

export const getTriggerFromLayer = (trigger: TmxObject): number => {
  return trigger ? getProperty(trigger, 'trigger') : null;
};

export const handleRoofTrigger = (
  trigger: TmxObject,
  triggerNumber: number,
  spritesLayerChildren: any[]
) => {
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
          COLLISION_CONFIG.BOX_POLYGON_TOLERANCE
        )
    ),
    each<Sprite>((sprite) =>
      easing.add(sprite, { alpha: ANIMATION_CONFIG.ALPHA_HIDDEN }, { 
        duration: ANIMATION_CONFIG.ROOF_FADE_DURATION 
      })
    )
  );

  const showRoofs = flow(
    filter<Sprite>((sprite) => sprite.accessibleType === `${UPPER_LAYER}`),
    each<Sprite>((sprite) =>
      easing.add(sprite, { alpha: ANIMATION_CONFIG.ALPHA_VISIBLE }, { 
        duration: ANIMATION_CONFIG.ROOF_FADE_DURATION 
      })
    )
  );

  return {
    hideRoofs: () => hideRoofs(spritesLayerChildren),
    showRoofs: () => showRoofs(spritesLayerChildren),
  };
};