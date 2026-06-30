import {
  Heading,
  headingDirection,
  headingFromMovementKey,
  MOVEMENT_SIMULATION_DELTA_MS,
  movementInputs,
  movementStepPixels,
  TILE_SIZE
} from '@bao/core';
import { CharacterState } from '@bao/server/schema/CharacterState';

import type { MovementCollision } from '@bao/client/lib/blocked-tiles-state';

const RECONCILE_SNAP_PX = TILE_SIZE * 0.75;
const RECONCILE_BLEND = 0.4;
const MAX_FRAME_MS = 50;

interface PredictionSnapshot {
  mapId: number;
  tileX: number;
  tileY: number;
  heading: Heading;
  speed: number;
  isMoving: boolean;
  targetTileX: number | null;
  targetTileY: number | null;
}

const toSnapshot = (character: CharacterState): PredictionSnapshot => ({
  mapId: character.mapId ?? 34,
  tileX: character.tile.x,
  tileY: character.tile.y,
  heading: character.heading as Heading,
  speed: character.speed,
  isMoving: character.isMoving,
  targetTileX: character.targetTile?.x ?? null,
  targetTileY: character.targetTile?.y ?? null
});

const clampToTarget = (
  heading: Heading,
  x: number,
  y: number,
  targetX: number,
  targetY: number
) => {
  switch (heading) {
    case Heading.EAST:
      return { x: Math.min(x, targetX), y };
    case Heading.WEST:
      return { x: Math.max(x, targetX), y };
    case Heading.SOUTH:
      return { x, y: Math.min(y, targetY) };
    case Heading.NORTH:
      return { x, y: Math.max(y, targetY) };
    default:
      return { x, y };
  }
};

const tryStartMove = (
  snapshot: PredictionSnapshot,
  heading: Heading,
  collision?: MovementCollision
) => {
  const direction = headingDirection(heading);
  const targetTileX = snapshot.tileX + direction.x;
  const targetTileY = snapshot.tileY + direction.y;

  if (collision?.isTileBlocked(snapshot.mapId, targetTileX, targetTileY)) {
    return null;
  }

  return { targetTileX, targetTileY, heading };
};

const stopAtCurrentTile = (snapshot: PredictionSnapshot) => ({
  x: snapshot.tileX * TILE_SIZE,
  y: snapshot.tileY * TILE_SIZE,
  snapshot: {
    ...snapshot,
    targetTileX: null,
    targetTileY: null,
    isMoving: false
  }
});

const reachedTarget = (
  heading: Heading,
  x: number,
  y: number,
  targetX: number,
  targetY: number
) => {
  switch (heading) {
    case Heading.EAST:
      return x >= targetX;
    case Heading.WEST:
      return x <= targetX;
    case Heading.SOUTH:
      return y >= targetY;
    case Heading.NORTH:
      return y <= targetY;
    default:
      return true;
  }
};

export class LocalMovementPredictor {
  private snapshot: PredictionSnapshot | null = null;
  private predictedX = 0;
  private predictedY = 0;
  private lastAdvanceMs = 0;

  reset(character: CharacterState) {
    this.snapshot = toSnapshot(character);
    this.predictedX = character.x;
    this.predictedY = character.y;
    this.lastAdvanceMs = performance.now();
  }

  reconcile(character: CharacterState) {
    const next = toSnapshot(character);

    if (!this.snapshot || this.snapshot.mapId !== next.mapId) {
      this.reset(character);
      return;
    }

    const error = Math.hypot(
      character.x - this.predictedX,
      character.y - this.predictedY
    );

    if (error > RECONCILE_SNAP_PX) {
      this.reset(character);
      return;
    }

    this.predictedX =
      this.predictedX * (1 - RECONCILE_BLEND) + character.x * RECONCILE_BLEND;
    this.predictedY =
      this.predictedY * (1 - RECONCILE_BLEND) + character.y * RECONCILE_BLEND;
    this.snapshot = next;
  }

  advance(
    inputs: string[],
    collision?: MovementCollision,
    nowMs = performance.now()
  ) {
    if (!this.snapshot) {
      return { x: 0, y: 0 };
    }

    const deltaMs = Math.min(
      Math.max(0, nowMs - this.lastAdvanceMs),
      MAX_FRAME_MS
    );
    this.lastAdvanceMs = nowMs;

    if (deltaMs <= 0) {
      return { x: this.predictedX, y: this.predictedY };
    }

    let { predictedX: x, predictedY: y } = this;
    let snapshot = { ...this.snapshot };
    let { heading, isMoving } = snapshot;
    const { speed } = snapshot;
    const pressed = movementInputs(inputs);

    let remainingMs = deltaMs;

    while (remainingMs > 0) {
      const stepMs = Math.min(remainingMs, MOVEMENT_SIMULATION_DELTA_MS);
      const step = movementStepPixels(speed, stepMs);
      remainingMs -= stepMs;

      if (
        isMoving &&
        snapshot.targetTileX !== null &&
        snapshot.targetTileY !== null
      ) {
        if (
          collision?.isTileBlocked(
            snapshot.mapId,
            snapshot.targetTileX,
            snapshot.targetTileY
          )
        ) {
          ({ x, y, snapshot } = stopAtCurrentTile(snapshot));
          isMoving = false;
          continue;
        }

        const direction = headingDirection(heading);
        const targetX = snapshot.targetTileX * TILE_SIZE;
        const targetY = snapshot.targetTileY * TILE_SIZE;

        x += direction.x * step;
        y += direction.y * step;
        ({ x, y } = clampToTarget(heading, x, y, targetX, targetY));

        if (reachedTarget(heading, x, y, targetX, targetY)) {
          x = targetX;
          y = targetY;
          snapshot.tileX = snapshot.targetTileX;
          snapshot.tileY = snapshot.targetTileY;
          snapshot.targetTileX = null;
          snapshot.targetTileY = null;
          isMoving = false;
        }
      }

      if (!isMoving && pressed.length > 0) {
        const nextHeading = headingFromMovementKey(pressed[0]);
        if (nextHeading !== null) {
          const started = tryStartMove(snapshot, nextHeading, collision);
          if (started) {
            heading = started.heading;
            snapshot.targetTileX = started.targetTileX;
            snapshot.targetTileY = started.targetTileY;
            isMoving = true;
          }
        }
      }
    }

    snapshot.heading = heading;
    snapshot.isMoving = isMoving;
    this.snapshot = snapshot;
    this.predictedX = x;
    this.predictedY = y;

    return { x, y };
  }
}

export const localMovementPredictor = new LocalMovementPredictor();
