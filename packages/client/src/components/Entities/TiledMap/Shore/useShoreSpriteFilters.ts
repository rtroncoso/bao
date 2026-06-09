import { useEffect, useRef, useCallback } from 'react';

import { SHORE_FILTER_TIME_SCALE, ShoreSpriteFilter } from './ShoreSpriteFilter';
import { animatedFilters, registerAnimatedFilter } from './effectAnimationRegistry';

/** One filter per orientation (~15 max) — applied to a bucket container, not each sprite. */
export const useShoreSpriteFilters = () => {
  const poolRef = useRef(new Map<number, ShoreSpriteFilter>());

  useEffect(() => {
    return () => {
      poolRef.current.forEach((filter) => {
        animatedFilters.delete(filter);
      });
      poolRef.current.clear();
    };
  }, []);

  return useCallback((edgeMask: number): ShoreSpriteFilter | undefined => {
    if (edgeMask === 0) {
      return undefined;
    }

    let filter = poolRef.current.get(edgeMask);
    if (!filter) {
      filter = new ShoreSpriteFilter(edgeMask);
      registerAnimatedFilter(filter, SHORE_FILTER_TIME_SCALE);
      poolRef.current.set(edgeMask, filter);
    }

    return filter;
  }, []);
};
