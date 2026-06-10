import { useTick } from '@inlet/react-pixi';
import { MutableRefObject, useLayoutEffect, useRef } from 'react';
import lerp from 'lerp';

import { TILE_SIZE } from '@bao/core';

const INTERPOLATION_ALPHA = 1 / 3;
const SNAP_DISTANCE_PX = TILE_SIZE * 2;

export interface InterpolatedPosition {
  x: number;
  y: number;
}

export const useInterpolatedPosition = (
  targetX: number,
  targetY: number,
  enabled = true
): MutableRefObject<InterpolatedPosition> => {
  const positionRef = useRef<InterpolatedPosition>({ x: targetX, y: targetY });
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
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
    }
  }, [targetX, targetY]);

  useTick(() => {
    if (!enabled) {
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
