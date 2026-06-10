import { Container, Sprite } from 'pixi.js';
import { TILE_SIZE } from '@bao/core';

import { ShoreSpriteFilter } from './ShoreSpriteFilter';

export const SHORE_BUCKET_PREFIX = 'shore-bucket-';

const shoreBuckets = new Map<number, Container>();

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

export const resetShoreBuckets = (): void => {
  shoreBuckets.forEach((bucket) => {
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

export const getShoreBucket = (edgeMask: number): Container => {
  let bucket = shoreBuckets.get(edgeMask);
  if (!bucket) {
    bucket = new Container();
    bucket.name = `${SHORE_BUCKET_PREFIX}${edgeMask}`;
    shoreBuckets.set(edgeMask, bucket);
  }

  return bucket;
};

export const mountShoreBuckets = (
  shoreLayer: Container,
  getFilter: (edgeMask: number) => ShoreSpriteFilter | undefined
): void => {
  shoreBuckets.forEach((bucket, edgeMask) => {
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

    bucket.position.set(minX, minY);

    bucket.children.forEach((child) => {
      const sprite = child as Sprite;
      const { left, top } = getSpriteBounds(sprite);
      sprite.position.set(
        left - minX + sprite.width * sprite.anchor.x,
        top - minY + sprite.height * sprite.anchor.y
      );
    });

    const filter = getFilter(edgeMask);
    if (filter) {
      filter.syncBounds(minX, minY, width, height);
      bucket.filterArea = null;
      bucket.filters = [filter];
    } else {
      bucket.filters = null;
      bucket.filterArea = null;
    }

    bucket.visible = true;
    bucket.renderable = true;
    bucket.parentGroup = null;

    (bucket as Container & { _boundsID?: number })._boundsID =
      ((bucket as Container & { _boundsID?: number })._boundsID ?? 0) + 1;

    if (bucket.parent !== shoreLayer) {
      shoreLayer.addChild(bucket);
    }
  });
};

export const isShoreBucket = (child: unknown): child is Container =>
  child instanceof Container &&
  typeof child.name === 'string' &&
  child.name.startsWith(SHORE_BUCKET_PREFIX);

/** Pixi caches filtered containers until bounds change — call every tick for live waves. */
export const invalidateShoreBucketsForAnimation = (): void => {
  shoreBuckets.forEach((bucket) => {
    if (!bucket.filters?.length || bucket.children.length === 0) {
      return;
    }

    (bucket as Container & { _boundsID?: number })._boundsID =
      ((bucket as Container & { _boundsID?: number })._boundsID ?? 0) + 1;
  });
};
