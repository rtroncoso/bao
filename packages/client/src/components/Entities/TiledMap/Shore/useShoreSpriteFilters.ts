import { useEffect, useRef, useCallback } from 'react';

import {
  SHORE_FILTER_TIME_SCALE,
  ShoreSpriteFilter
} from './ShoreSpriteFilter';
import {
  animatedFilters,
  registerAnimatedFilter
} from './effectAnimationRegistry';
import { shoreBitmaskToUniform } from './shoreUtils';

/** One filter per shore edge mask (bucket-level — shared by sprites in that bucket). */
export const useShoreSpriteFilters = () => {
  const bucketFiltersRef = useRef(new Map<number, ShoreSpriteFilter>());

  useEffect(() => {
    const filters = bucketFiltersRef.current;
    return () => {
      filters.forEach((filter) => {
        animatedFilters.delete(filter);
      });
      filters.clear();
    };
  }, []);

  return useCallback((edgeMask: number): ShoreSpriteFilter | undefined => {
    if (edgeMask === 0) {
      return undefined;
    }

    let filter = bucketFiltersRef.current.get(edgeMask);
    if (!filter) {
      filter = new ShoreSpriteFilter(edgeMask);
      registerAnimatedFilter(filter, SHORE_FILTER_TIME_SCALE);
      bucketFiltersRef.current.set(edgeMask, filter);
    } else {
      filter.uniforms.waterEdges = shoreBitmaskToUniform(edgeMask);
    }

    return filter;
  }, []);
};
