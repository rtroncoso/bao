import { Container, Sprite } from 'pixi.js';
import { TILE_SIZE } from '@bao/core';

import { ShoreSpriteFilter } from './ShoreSpriteFilter';

export const SHORE_BUCKET_PREFIX = 'shore-bucket-';

const shoreBucketsByMap = new Map<number, Map<number, Container>>();

const getMapBuckets = (mapId: number): Map<number, Container> => {
  let buckets = shoreBucketsByMap.get(mapId);
  if (!buckets) {
    buckets = new Map();
    shoreBucketsByMap.set(mapId, buckets);
  }
  return buckets;
};

const getSpriteBounds = (sprite: Sprite) => {
  const left = sprite.x - sprite.width * sprite.anchor.x;
  const top = sprite.y - sprite.height * sprite.anchor.y;
  return {
    left,
    top,
    right: left + sprite.width,
    bottom: top + sprite.height
  };
};

export const resetShoreBuckets = (mapId: number): void => {
  getMapBuckets(mapId).forEach((bucket) => {
    bucket.children.slice().forEach((child) => {
      const sprite = child as Sprite;
      sprite.filters = null;
      sprite.filterArea = null;
      sprite.parentGroup = null;
    });
    bucket.removeChildren();
    bucket.position.set(0, 0);
    bucket.filters = null;
    bucket.filterArea = null;
    bucket.parentGroup = null;
  });
};

export const getShoreBucket = (mapId: number, edgeMask: number): Container => {
  const buckets = getMapBuckets(mapId);
  let bucket = buckets.get(edgeMask);
  if (!bucket) {
    bucket = new Container();
    bucket.name = `${SHORE_BUCKET_PREFIX}${mapId}-${edgeMask}`;
    buckets.set(edgeMask, bucket);
  }

  return bucket;
};

export const mountShoreBuckets = (
  mapId: number,
  shoreLayer: Container,
  getFilter: (edgeMask: number) => ShoreSpriteFilter | undefined
): void => {
  getMapBuckets(mapId).forEach((bucket, edgeMask) => {
    if (bucket.children.length === 0) {
      if (bucket.parent) {
        bucket.parent.removeChild(bucket);
      }
      bucket.position.set(0, 0);
      bucket.filters = null;
      bucket.filterArea = null;
      bucket.parentGroup = null;
      return;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    bucket.children.forEach((child) => {
      const { left, top, right, bottom } = getSpriteBounds(child as Sprite);
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });

    const width = Math.max(TILE_SIZE, maxX - minX);
    const height = Math.max(TILE_SIZE, maxY - minY);
    const bucketX = Math.round(minX);
    const bucketY = Math.round(minY);

    bucket.position.set(bucketX, bucketY);

    bucket.children.forEach((child) => {
      const sprite = child as Sprite;
      const { left, top } = getSpriteBounds(sprite);
      sprite.position.set(
        Math.round(left - bucketX + sprite.width * sprite.anchor.x),
        Math.round(top - bucketY + sprite.height * sprite.anchor.y)
      );
    });

    const filter = getFilter(edgeMask);
    if (filter) {
      filter.syncBounds(bucketX, bucketY, width, height);
      bucket.filterArea = null;
      bucket.filters = [filter];
    } else {
      bucket.filters = null;
      bucket.filterArea = null;
    }

    bucket.visible = true;
    bucket.renderable = true;
    bucket.parentGroup = null;

    if (bucket.parent !== shoreLayer) {
      shoreLayer.addChild(bucket);
    }
  });
};

export const isShoreBucket = (child: unknown): child is Container =>
  child instanceof Container &&
  typeof child.name === 'string' &&
  child.name.startsWith(SHORE_BUCKET_PREFIX);

/** Tear down filtered buckets when a map instance unmounts (map transition). */
export const disposeShoreBucketsForMap = (mapId: number): void => {
  const buckets = shoreBucketsByMap.get(mapId);
  if (!buckets) {
    return;
  }

  buckets.forEach((bucket) => {
    bucket.children.slice().forEach((child) => {
      const sprite = child as Sprite;
      sprite.filters = null;
      sprite.filterArea = null;
      sprite.parentGroup = null;
    });
    bucket.removeChildren();
    bucket.filters = null;
    bucket.filterArea = null;
    bucket.parentGroup = null;
    if (bucket.parent) {
      bucket.parent.removeChild(bucket);
    }
    bucket.destroy({ children: true });
  });

  shoreBucketsByMap.delete(mapId);
};
