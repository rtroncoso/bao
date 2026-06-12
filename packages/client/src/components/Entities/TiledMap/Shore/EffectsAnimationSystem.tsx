import { Container, useTick } from '@inlet/react-pixi';
import React from 'react';

import {
  advanceGlobalAnimationTime,
  animatedFilters,
  getFilterTimeScale,
  getGlobalAnimationTime
} from './effectAnimationRegistry';
export const EffectsAnimationSystem: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  useTick((delta) => {
    advanceGlobalAnimationTime(delta);

    if (animatedFilters.size === 0) {
      return;
    }

    const globalTime = getGlobalAnimationTime();
    animatedFilters.forEach((filter) => {
      filter.uniforms.time = globalTime * getFilterTimeScale(filter);
    });
  });

  // Pixi node keeps useTick wired to the stage ticker.
  return (
    <>
      <Container interactive={false} interactiveChildren={false} />
      {children}
    </>
  );
};
