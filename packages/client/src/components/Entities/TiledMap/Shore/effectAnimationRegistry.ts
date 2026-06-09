import { Filter } from 'pixi.js';

export const animatedFilters = new Set<Filter>();

const filterTimeScales = new WeakMap<Filter, number>();

const DEFAULT_TIME_SCALE = 0.07;

/** Monotonic clock — survives filter pool churn so waves never reset to zero. */
let globalAnimationTime = 0;

export const advanceGlobalAnimationTime = (delta: number): void => {
  globalAnimationTime += delta;
};

export const getGlobalAnimationTime = (): number => globalAnimationTime;

export const registerAnimatedFilter = (
  filter: Filter,
  timeScale = DEFAULT_TIME_SCALE
) => {
  animatedFilters.add(filter);
  filterTimeScales.set(filter, timeScale);

  return () => {
    animatedFilters.delete(filter);
    filterTimeScales.delete(filter);
  };
};

export const getFilterTimeScale = (filter: Filter): number =>
  filterTimeScales.get(filter) ?? DEFAULT_TIME_SCALE;
