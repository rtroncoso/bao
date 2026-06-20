import { useTick } from '@inlet/react-pixi';
import { MutableRefObject, useRef } from 'react';
import lerp from 'lerp';

import { TILE_SIZE } from '@bao/core';

const INTERPOLATION_ALPHA = 1 / 3;
const SNAP_DISTANCE_PX = TILE_SIZE * 2;

export interface InterpolatedPosition {
  x: number;
  y: number;
}

/** Lerp toward live target read each tick (no React re-render per position patch). */
export const useInterpolatedPosition = (
  getTarget: () => { x: number; y: number }
): MutableRefObject<InterpolatedPosition> => {
  const positionRef = useRef<InterpolatedPosition>({ x: 0, y: 0 });
  const initializedRef = useRef(false);
  const getTargetRef = useRef(getTarget);
  getTargetRef.current = getTarget;

  useTick(() => {
    const { x: targetX, y: targetY } = getTargetRef.current();

    if (!initializedRef.current) {
      positionRef.current.x = targetX;
      positionRef.current.y = targetY;
      initializedRef.current = true;
      return;
    }

    const dx = Math.abs(positionRef.current.x - targetX);
    const dy = Math.abs(positionRef.current.y - targetY);

    if (dx > SNAP_DISTANCE_PX || dy > SNAP_DISTANCE_PX) {
      positionRef.current.x = targetX;
      positionRef.current.y = targetY;
      return;
    }

    positionRef.current.x = lerp(
      positionRef.current.x,
      targetX,
      INTERPOLATION_ALPHA
    );
    positionRef.current.y = lerp(
      positionRef.current.y,
      targetY,
      INTERPOLATION_ALPHA
    );
  });

  return positionRef;
};
