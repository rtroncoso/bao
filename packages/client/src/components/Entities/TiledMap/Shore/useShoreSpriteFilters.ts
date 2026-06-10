import { useEffect, useRef, useCallback } from 'react';
import { Sprite } from 'pixi.js';

import { SHORE_FILTER_TIME_SCALE, ShoreSpriteFilter } from './ShoreSpriteFilter';
import { animatedFilters, registerAnimatedFilter } from './effectAnimationRegistry';

/** One filter per visible shore sprite — Pixi cannot share a Filter across sprites. */
export const useShoreSpriteFilters = () => {
  const spriteFiltersRef = useRef(new WeakMap<Sprite, ShoreSpriteFilter>());
  const allFiltersRef = useRef(new Set<ShoreSpriteFilter>());

  useEffect(() => {
    return () => {
      allFiltersRef.current.forEach((filter) => {
        animatedFilters.delete(filter);
      });
      allFiltersRef.current.clear();
    };
  }, []);

  return useCallback(
    (edgeMask: number, sprite: Sprite): ShoreSpriteFilter | undefined => {
      if (edgeMask === 0) {
        return undefined;
      }

      let filter = spriteFiltersRef.current.get(sprite);
      if (!filter) {
        filter = new ShoreSpriteFilter(edgeMask);
        registerAnimatedFilter(filter, SHORE_FILTER_TIME_SCALE);
        spriteFiltersRef.current.set(sprite, filter);
        allFiltersRef.current.add(filter);
      }

      return filter;
    },
    []
  );
};
