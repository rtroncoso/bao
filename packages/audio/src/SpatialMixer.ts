/** AO-style pseudo-3D: distance attenuation + stereo pan by tile offset. */
export const MAX_DISTANCE_TILES = 22;

export interface ListenerPosition {
  x: number;
  y: number;
}

export interface SpatialMix {
  gain: number;
  pan: number;
}

/**
 * Log-shaped falloff: full volume when close, dampening ramps up mainly near max range.
 * Uses t² so the curve stays flat around the listener (df/dt → 0 as t → 0).
 */
export const computeDistanceAttenuation = (
  distance: number,
  maxTiles = MAX_DISTANCE_TILES
): number => {
  if (distance <= 0) {
    return 1;
  }

  if (distance >= maxTiles) {
    return 0;
  }

  const t = distance / maxTiles;
  const k = 12;

  return 1 - Math.log1p(k * t * t) / Math.log1p(k);
};

export const computeSpatialMix = (
  sourceX: number,
  sourceY: number,
  listener: ListenerPosition,
  masterGain: number
): SpatialMix => {
  const deltaX = sourceX - listener.x;
  const deltaY = sourceY - listener.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance === 0) {
    return { gain: masterGain, pan: 0 };
  }

  const attenuation = computeDistanceAttenuation(distance);

  return {
    gain: masterGain * attenuation,
    pan: Math.max(-1, Math.min(1, deltaX / distance))
  };
};
