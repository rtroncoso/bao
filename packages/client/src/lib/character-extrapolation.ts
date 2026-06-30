import {
  Heading,
  headingDirection,
  movementStepPixels,
  TILE_SIZE
} from '@bao/core';

export interface ExtrapolatedCharacter {
  x: number;
  y: number;
  heading: number;
  speed: number;
  isMoving: boolean;
  targetTile?: { x: number; y: number } | null;
}

/** Advance map-local pixels between server patches (remote entities). */
export const extrapolateCharacterPixels = (
  character: ExtrapolatedCharacter,
  deltaMs: number
) => {
  if (!character.isMoving || !character.targetTile) {
    return { x: character.x, y: character.y };
  }

  const direction = headingDirection(character.heading as Heading);
  const step = movementStepPixels(character.speed, deltaMs);
  let x = character.x + direction.x * step;
  let y = character.y + direction.y * step;

  const targetX = character.targetTile.x * TILE_SIZE;
  const targetY = character.targetTile.y * TILE_SIZE;

  switch (character.heading as Heading) {
    case Heading.EAST:
      x = Math.min(x, targetX);
      break;
    case Heading.WEST:
      x = Math.max(x, targetX);
      break;
    case Heading.SOUTH:
      y = Math.min(y, targetY);
      break;
    case Heading.NORTH:
      y = Math.max(y, targetY);
      break;
    default:
      break;
  }

  return { x, y };
};
