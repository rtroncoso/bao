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

/** Per map + edge mask — one filter instance must not be shared across buckets. */
export const useShoreSpriteFilters = (mapId: number) => {
  const bucketFiltersRef = useRef(new Map<number, ShoreSpriteFilter>());

  useEffect(() => {
    const filters = bucketFiltersRef.current;
    return () => {
      filters.forEach((filter) => {
        animatedFilters.delete(filter);
      });
      filters.clear();
    };
  }, [mapId]);

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
