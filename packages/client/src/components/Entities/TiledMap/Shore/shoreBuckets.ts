import { Container, Rectangle, Sprite } from 'pixi.js';
import { Group } from '@pixi/layers';
import { TILE_SIZE } from '@bao/core';

import { ShoreSpriteFilter } from './ShoreSpriteFilter';

export const SHORE_BUCKET_PREFIX = 'shore-bucket-';

const shoreBuckets = new Map<number, Container>();

export const resetShoreBuckets = (): void => {
  shoreBuckets.forEach((bucket) => {
    bucket.removeChildren();
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
  getFilter: (edgeMask: number) => ShoreSpriteFilter | undefined,
  shoreGroup?: Group
): void => {
  shoreBuckets.forEach((bucket, edgeMask) => {
    if (bucket.children.length === 0) {
      if (bucket.parent) {
        bucket.parent.removeChild(bucket);
      }
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
      const sprite = child as Sprite;
      const left = sprite.x - sprite.width * sprite.anchor.x;
      const top = sprite.y - sprite.height * sprite.anchor.y;
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + sprite.width);
      maxY = Math.max(maxY, top + sprite.height);
    });

    const width = Math.max(TILE_SIZE, maxX - minX);
    const height = Math.max(TILE_SIZE, maxY - minY);

    const filter = getFilter(edgeMask);
    if (filter) {
      filter.syncBounds(minX, minY, width, height);
      bucket.filterArea = new Rectangle(minX, minY, width, height);
      bucket.filters = [filter];
    }

    bucket.visible = true;
    bucket.renderable = true;

    if (shoreGroup) {
      bucket.parentGroup = shoreGroup;
    }

    (bucket as Container & { _boundsID?: number })._boundsID =
      ((bucket as Container & { _boundsID?: number })._boundsID ?? 0) + 1;

    shoreLayer.addChild(bucket);
  });
};

export const isShoreBucket = (child: unknown): child is Container =>
  child instanceof Container &&
  typeof child.name === 'string' &&
  child.name.startsWith(SHORE_BUCKET_PREFIX);
