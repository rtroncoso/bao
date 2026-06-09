import React from 'react';
import {
  Rectangle,
  AnimatedSprite,
  Sprite,
  Texture,
  DisplayObject
} from 'pixi.js';
import { boxPolygon } from 'intersects';
import { Ease } from 'pixi-ease';

import flow from 'lodash/fp/flow';
import filter from 'lodash/fp/filter';
import mapValues from 'lodash/fp/mapValues';
import groupBy from 'lodash/fp/groupBy';
import each from 'lodash/fp/each';

import {
  TILE_SIZE,
  getProperty,
  getTexture,
  TmxObject,
  Graphic,
  UPPER_LAYER,
  tmxLayerToRenderGroup
} from '@bao/core';
import { polygon } from '@bao/client/utils';
import { ObjectsInViewport, SpritesCache } from './types';
import { ANIMATION_CONFIG, COLLISION_CONFIG, SHORE_TILE_LAYER_INDEX, TMX_SHORE_SPRITE_LAYER } from './constants';
import { SpatialHashGrid, TileLayerChunk, SHORE_TILE_CHUNK_NAME } from './spatial';
import { CompositeTilemap } from '@pixi/tilemap';
import {
  getShoreOrientation,
  applyShoreSpriteOverlap,
  getShoreTileOrigin,
  shoreEdgesToBitmask,
  ShoreEdges
} from './Shore/shoreUtils';
import { ShoreSpriteFilter } from './Shore/ShoreSpriteFilter';
import {
  getShoreBucket,
  isShoreBucket,
  mountShoreBuckets,
  resetShoreBuckets
} from './Shore/shoreBuckets';

type ShoreCachedSprite = Sprite & { shoreTileX: number; shoreTileY: number };

const getShoreTileCoords = (sprite: Sprite): { x: number; y: number } => {
  const shoreSprite = sprite as ShoreCachedSprite;
  if (typeof shoreSprite.shoreTileX === 'number' && typeof shoreSprite.shoreTileY === 'number') {
    return { x: shoreSprite.shoreTileX, y: shoreSprite.shoreTileY };
  }

  return getShoreTileOrigin(sprite);
};

const easing = new Ease({});

export const createSpritePool = (size: number): Sprite[] => {
  return Array.from({ length: size }, () => new Sprite(Texture.EMPTY));
};

export const createAnimationPool = (size: number): AnimatedSprite[] => {
  return Array.from(
    { length: size },
    () => new AnimatedSprite([Texture.EMPTY])
  );
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
  sprite.scale.set(1, 1);

  const texture = sprite.texture;

  if (Number(layerNumber) === TMX_SHORE_SPRITE_LAYER) {
    sprite.width = TILE_SIZE;
    sprite.height = TILE_SIZE;
    const shoreSprite = sprite as ShoreCachedSprite;
    shoreSprite.shoreTileX = x;
    shoreSprite.shoreTileY = y;
  } else if (texture?.width && texture?.height) {
    sprite.width = texture.width;
    sprite.height = texture.height;
  }

  const group = mapState.groups[tmxLayerToRenderGroup(layerNumber)];
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

export interface ObjectRenderBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Render-space AABB matching sprite placement in createSpriteFromObject. */
export const getObjectRenderBounds = (object: TmxObject): ObjectRenderBounds => ({
  x: getProperty(object, 'x') ?? object.x,
  y: getProperty(object, 'y') ?? object.y,
  width: getProperty(object, 'width') ?? object.width ?? TILE_SIZE,
  height: getProperty(object, 'height') ?? object.height ?? TILE_SIZE
});

export const getObjectsInViewport = (
  spatialGrid: SpatialHashGrid<TmxObject>,
  bounds: Rectangle
): ObjectsInViewport => {
  const objects = spatialGrid.query(bounds);

  return flow(
    groupBy((object: TmxObject) => getProperty(object, 'layer')),
    mapValues<TmxObject[], string[]>((layer) => layer.map((o) => o.id))
  )(objects);
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

export const renderTileLayers = (
  chunks: TileLayerChunk[],
  targets: {
    tilesLayer: React.RefObject<any>;
    shoreLayer: React.RefObject<any>;
  },
  shoreLayerIndex = SHORE_TILE_LAYER_INDEX
) => {
  if (!targets.tilesLayer.current || !targets.shoreLayer.current) {
    return chunks;
  }

  targets.tilesLayer.current.removeChildren();

  const shoreContainer = targets.shoreLayer.current;
  shoreContainer.children.slice().forEach((child) => {
    if (
      child instanceof CompositeTilemap ||
      child.name === SHORE_TILE_CHUNK_NAME ||
      isShoreBucket(child)
    ) {
      return;
    }

    shoreContainer.removeChild(child);
  });

  chunks.forEach(({ displayObject, layerIndex }) => {
    displayObject.filters = null;

    if (layerIndex === shoreLayerIndex) {
      targets.shoreLayer.current.addChild(displayObject);
      return;
    }

    targets.tilesLayer.current.addChild(displayObject);
  });

  return chunks;
};

export interface SpriteRenderOptions {
  shoreTarget?: React.RefObject<any>;
  getShoreSpriteFilter?: (edgeMask: number) => ShoreSpriteFilter | undefined;
  shoreOrientations?: Map<string | number, ShoreEdges>;
  shoreGroup?: import('@pixi/layers').Group;
}

export const renderSpriteLayers = (
  nodes: ObjectsInViewport,
  target: React.RefObject<any>,
  cache: SpritesCache,
  options?: SpriteRenderOptions
) => {
  if (target.current) {
    target.current.removeChildren();
  }
  if (options?.shoreTarget?.current) {
    const shoreContainer = options.shoreTarget.current;
    shoreContainer.children.slice().forEach((child) => {
      if (
        child instanceof CompositeTilemap ||
        child.name === SHORE_TILE_CHUNK_NAME ||
        isShoreBucket(child)
      ) {
        return;
      }

      shoreContainer.removeChild(child);
    });
    resetShoreBuckets();
  }

  const shoreLayer = options?.shoreTarget?.current;

  Object.values(nodes)
    .flat()
    .forEach((id) => {
      const sprite =
        cache[id] ??
        cache[String(id)] ??
        cache[Number(id as string)];
      if (!sprite) {
        return;
      }

      const isShoreLayerSprite =
        sprite.accessibleType === `${TMX_SHORE_SPRITE_LAYER}`;
      const isShoreSprite = isShoreLayerSprite && options?.shoreTarget?.current;

      if (isShoreSprite) {
        const edges = options?.shoreOrientations
          ? getShoreOrientation(options.shoreOrientations, id)
          : undefined;
        const edgeMask = shoreEdgesToBitmask(
          edges ?? { top: false, right: false, bottom: false, left: false }
        );

        const { x: tileX, y: tileY } = getShoreTileCoords(sprite);

        if (edges) {
          applyShoreSpriteOverlap(sprite, edges, tileX, tileY);
        } else {
          sprite.anchor.set(0, 0);
          sprite.position.set(tileX, tileY);
          sprite.width = TILE_SIZE;
          sprite.height = TILE_SIZE;
        }

        sprite.filterArea = null;
        sprite.filters = null;
        sprite.visible = true;
        sprite.alpha = 1;
        sprite.renderable = true;
        sprite.parentGroup = options.shoreGroup ?? sprite.parentGroup;

        if (edgeMask > 0 && shoreLayer && options.getShoreSpriteFilter) {
          getShoreBucket(edgeMask).addChild(sprite);
        } else {
          shoreLayer?.addChild(sprite);
        }
        return;
      }

      sprite.filterArea = null;
      sprite.filters = null;
      target.current?.addChild(sprite);
    });

  if (shoreLayer && options?.getShoreSpriteFilter) {
    mountShoreBuckets(shoreLayer, options.getShoreSpriteFilter);
  }

  return nodes;
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
      easing.add(
        sprite,
        { alpha: ANIMATION_CONFIG.ALPHA_HIDDEN },
        {
          duration: ANIMATION_CONFIG.ROOF_FADE_DURATION
        }
      )
    )
  );

  const showRoofs = flow(
    filter<Sprite>((sprite) => sprite.accessibleType === `${UPPER_LAYER}`),
    each<Sprite>((sprite) =>
      easing.add(
        sprite,
        { alpha: ANIMATION_CONFIG.ALPHA_VISIBLE },
        {
          duration: ANIMATION_CONFIG.ROOF_FADE_DURATION
        }
      )
    )
  );

  return {
    hideRoofs: () => hideRoofs(spritesLayerChildren),
    showRoofs: () => showRoofs(spritesLayerChildren)
  };
};
