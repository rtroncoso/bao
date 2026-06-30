import { useTick } from '@inlet/react-pixi';
import { MutableRefObject, useRef } from 'react';
import lerp from 'lerp';

import { TILE_SIZE } from '@bao/core';
import { extrapolateCharacterPixels } from '@bao/client/lib/character-extrapolation';

const INTERPOLATION_ALPHA = 0.45;
const SNAP_DISTANCE_PX = TILE_SIZE * 2;
const MAX_FRAME_MS = 50;

export interface InterpolatedPosition {
  x: number;
  y: number;
}

/** Render-time extrapolation + lerp between Colyseus patches (remote players). */
export const useInterpolatedPosition = (
  getTarget: () => {
    x: number;
    y: number;
    heading: number;
    speed: number;
    isMoving: boolean;
    targetTile?: { x: number; y: number } | null;
  }
): MutableRefObject<InterpolatedPosition> => {
  const positionRef = useRef<InterpolatedPosition>({ x: 0, y: 0 });
  const initializedRef = useRef(false);
  const lastAdvanceMs = useRef(0);
  const getTargetRef = useRef(getTarget);
  getTargetRef.current = getTarget;

  useTick(() => {
    const character = getTargetRef.current();
    const nowMs = performance.now();
    const deltaMs = Math.min(
      Math.max(0, nowMs - lastAdvanceMs.current),
      MAX_FRAME_MS
    );
    lastAdvanceMs.current = nowMs;

    const extrapolated = extrapolateCharacterPixels(character, deltaMs);
    const targetX = extrapolated.x;
    const targetY = extrapolated.y;

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
