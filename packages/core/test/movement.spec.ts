import { expect } from 'chai';

import {
  MOVEMENT_TUNING_REFERENCE_DELTA_MS,
  movementStepPixels
} from '@bao/core/constants/game/Movement';

describe('movementStepPixels', () => {
  it('moves one legacy 60 Hz step at the tuning reference delta', () => {
    const speed = 64;
    expect(movementStepPixels(speed, MOVEMENT_TUNING_REFERENCE_DELTA_MS)).to.equal(
      speed / MOVEMENT_TUNING_REFERENCE_DELTA_MS
    );
  });

  it('covers the same distance per second regardless of step size', () => {
    const speed = 64;
    const slow = movementStepPixels(speed, 50) * (1000 / 50);
    const fast = movementStepPixels(speed, 8) * (1000 / 8);
    expect(slow).to.be.closeTo(fast, 0.01);
  });
});
