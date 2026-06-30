import { Heading } from './Game';

/** Server simulation rate (Hz). Colyseus interval is 1000 / rate ms — configurable, not fixed. */
export const MOVEMENT_TICK_RATE = 128;

export const MOVEMENT_SIMULATION_DELTA_MS = 1000 / MOVEMENT_TICK_RATE;

/** Speed curve was originally tuned at 60 Hz — keep independent of sim tick rate. */
export const MOVEMENT_TUNING_REFERENCE_DELTA_MS = 1000 / 60;

/** Authoritative state broadcast rate (Hz). Rendering interpolates/predicts between patches. */
export const MOVEMENT_PATCH_RATE = 30;

export const MOVEMENT_PATCH_INTERVAL_MS = 1000 / MOVEMENT_PATCH_RATE;

export const DEFAULT_CHARACTER_SPEED = 50;

export const MOVEMENT_KEYS = ['a', 'd', 'w', 's'] as const;

export type MovementKey = (typeof MOVEMENT_KEYS)[number];

/** Pixels moved over deltaTimeMs; speed constant is in AO units. */
export const movementStepPixels = (speed: number, deltaTimeMs: number) =>
  (speed * deltaTimeMs) / MOVEMENT_TUNING_REFERENCE_DELTA_MS ** 2;

export const headingFromMovementKey = (key: string): Heading | null => {
  switch (key) {
    case 's':
      return Heading.SOUTH;
    case 'd':
      return Heading.EAST;
    case 'w':
      return Heading.NORTH;
    case 'a':
      return Heading.WEST;
    default:
      return null;
  }
};

export const headingDirection = (heading: Heading) => ({
  x: heading === Heading.WEST ? -1 : heading === Heading.EAST ? 1 : 0,
  y: heading === Heading.NORTH ? -1 : heading === Heading.SOUTH ? 1 : 0
});

export const movementInputs = (inputs: Iterable<string>) =>
  [...inputs].filter((key): key is MovementKey =>
    (MOVEMENT_KEYS as readonly string[]).includes(key)
  );
