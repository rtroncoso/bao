import { Container, Sprite } from 'pixi.js';
import { TILE_SIZE } from '@bao/core';

import { ShoreSpriteFilter } from './ShoreSpriteFilter';

export const SHORE_BUCKET_PREFIX = 'shore-bucket-';

const shoreBuckets = new Map<number, Container>();

export const resetShoreBuckets = (): void => {
  shoreBuckets.forEach((bucket) => {
    bucket.removeChildren();
    bucket.filters = null;
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
      return;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    bucket.children.forEach((child) => {
      const sprite = child as Sprite;
      const left = sprite.x - sprite.width * sprite.anchor.x;
      const top = sprite.y - sprite.height * sprite.anchor.y;
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + sprite.width);
      maxY = Math.max(maxY, top + sprite.height);
    });

    const filter = getFilter(edgeMask);
    if (filter) {
      filter.syncBounds(
        minX,
        minY,
        Math.max(TILE_SIZE, maxX - minX),
        Math.max(TILE_SIZE, maxY - minY)
      );
      bucket.filters = [filter];
    }

    shoreLayer.addChild(bucket);
  });
};

export const isShoreBucket = (child: unknown): child is Container =>
  child instanceof Container &&
  typeof child.name === 'string' &&
  child.name.startsWith(SHORE_BUCKET_PREFIX);
