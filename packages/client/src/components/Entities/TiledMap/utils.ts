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
import {
  ANIMATION_CONFIG,
  COLLISION_CONFIG,
  SHORE_SPRITE_CULL_PADDING,
  SHORE_TILE_LAYER_INDEX,
  TMX_SHORE_SPRITE_LAYER
} from './constants';
import {
  intersectsBounds,
  SpatialHashGrid,
  TileLayerChunk,
  SHORE_TILE_CHUNK_NAME
} from './spatial';
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
  if (
    typeof shoreSprite.shoreTileX === 'number' &&
    typeof shoreSprite.shoreTileY === 'number'
  ) {
    return { x: shoreSprite.shoreTileX, y: shoreSprite.shoreTileY };
  }

  return getShoreTileOrigin(sprite);
};

const easing = new Ease({});

const detachShoreSprite = (sprite: Sprite): void => {
  sprite.filters = null;
  sprite.filterArea = null;
  sprite.parentGroup = null;
  sprite.visible = false;
  sprite.renderable = false;
};

const detachShoreBucket = (bucket: import('pixi.js').Container): void => {
  bucket.children.slice().forEach((child) => {
    if (child instanceof Sprite) {
      detachShoreSprite(child);
    }
  });
  bucket.removeChildren();
  bucket.filters = null;
  bucket.filterArea = null;
  bucket.parentGroup = null;
};

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

  if (Number(layerNumber) !== TMX_SHORE_SPRITE_LAYER) {
    const group = mapState.groups[tmxLayerToRenderGroup(layerNumber)];
    if (group) {
      sprite.parentGroup = group;
    }
  } else {
    sprite.parentGroup = null;
  }
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

/** Cull bounds for shore sprites — includes overlap/anchor stretch beyond the 32px tile. */
export const getShoreSpriteCullBounds = (
  object: TmxObject
): ObjectRenderBounds => {
  const tileX = getProperty(object, 'x') ?? object.x;
  const tileY = getProperty(object, 'y') ?? object.y;
  const pad = SHORE_SPRITE_CULL_PADDING;

  return {
    x: tileX - pad,
    y: tileY - pad,
    width: TILE_SIZE + pad * 2,
    height: TILE_SIZE + pad * 2
  };
};

/** Render-space AABB used for spatial-hash insert and viewport queries. */
export const getObjectRenderBounds = (
  object: TmxObject
): ObjectRenderBounds => {
  if (Number(getProperty(object, 'layer')) === TMX_SHORE_SPRITE_LAYER) {
    return getShoreSpriteCullBounds(object);
  }

  return {
    x: getProperty(object, 'x') ?? object.x,
    y: getProperty(object, 'y') ?? object.y,
    width: getProperty(object, 'width') ?? object.width ?? TILE_SIZE,
    height: getProperty(object, 'height') ?? object.height ?? TILE_SIZE
  };
};

/** Shore sprites bypass SHG misses — cheap brute-force over the fixed layer-2 set. */
export const ensureShoreSpritesInViewport = (
  viewport: ObjectsInViewport,
  shoreSprites: TmxObject[],
  bounds: Rectangle
): ObjectsInViewport => {
  const layerKey = String(TMX_SHORE_SPRITE_LAYER);
  const ids = [...(viewport[layerKey] ?? [])];
  const seen = new Set(ids.map((id) => String(id)));
  let changed = false;

  shoreSprites.forEach((object) => {
    const id = object.id;
    if (seen.has(String(id))) {
      return;
    }

    if (intersectsBounds(getShoreSpriteCullBounds(object), bounds)) {
      ids.push(id);
      seen.add(String(id));
      changed = true;
    }
  });

  if (!changed) {
    return viewport;
  }

  return { ...viewport, [layerKey]: ids };
};

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
  shoreLayerIndex = SHORE_TILE_LAYER_INDEX,
  shoreGroup?: import('@pixi/layers').Group
) => {
  if (!targets.tilesLayer.current || !targets.shoreLayer.current) {
    return chunks;
  }

  const visibleChunks = new Set(
    chunks.map(({ displayObject }) => displayObject)
  );
  const shoreContainer = targets.shoreLayer.current;

  targets.tilesLayer.current.removeChildren();

  shoreContainer.children.slice().forEach((child) => {
    if (visibleChunks.has(child)) {
      return;
    }

    if (child instanceof CompositeTilemap) {
      child.filters = null;
      child.parentGroup = null;
      shoreContainer.removeChild(child);
    }
  });

  chunks.forEach(({ displayObject, layerIndex }) => {
    displayObject.filters = null;

    if (layerIndex === shoreLayerIndex) {
      displayObject.parentGroup = null;
      if (displayObject.parent !== shoreContainer) {
        shoreContainer.addChild(displayObject);
      }
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
  const shoreLayer = options?.shoreTarget?.current;
  const isShorePass = Boolean(shoreLayer && options?.getShoreSpriteFilter);

  if (target.current) {
    target.current.removeChildren();
  }

  // Shore buckets are populated only on the sprites pass — never reset on the objects pass.
  if (isShorePass) {
    resetShoreBuckets();

    shoreLayer.children.slice().forEach((child) => {
      if (
        child instanceof CompositeTilemap ||
        child.name === SHORE_TILE_CHUNK_NAME
      ) {
        return;
      }

      if (isShoreBucket(child)) {
        detachShoreBucket(child);
        shoreLayer.removeChild(child);
        return;
      }

      if (child instanceof Sprite) {
        detachShoreSprite(child);
        shoreLayer.removeChild(child);
      }
    });
  }

  Object.values(nodes)
    .flat()
    .forEach((id) => {
      const sprite =
        cache[id] ?? cache[String(id)] ?? cache[Number(id as string)];
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

        sprite.filters = null;
        sprite.filterArea = null;
        sprite.parentGroup = null;
        sprite.visible = true;
        sprite.alpha = 1;
        sprite.renderable = true;

        if (edgeMask === 0) {
          shoreLayer.addChild(sprite);
        } else {
          getShoreBucket(edgeMask).addChild(sprite);
        }
        return;
      }

      sprite.filterArea = null;
      sprite.filters = null;
      target.current?.addChild(sprite);
    });

  if (isShorePass) {
    mountShoreBuckets(shoreLayer, options!.getShoreSpriteFilter!);
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
