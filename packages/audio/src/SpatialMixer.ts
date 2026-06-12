/** AO-style pseudo-3D: distance attenuation + stereo pan by tile offset. */
export const MAX_DISTANCE_TILES = 18;

export interface ListenerPosition {
  x: number;
  y: number;
}

export interface SpatialMix {
  gain: number;
  pan: number;
}

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

  const attenuation =
    distance > MAX_DISTANCE_TILES
      ? 0
      : 1 - distance / MAX_DISTANCE_TILES;

  return {
    gain: masterGain * attenuation,
    pan: Math.max(-1, Math.min(1, deltaX / distance))
  };
};
