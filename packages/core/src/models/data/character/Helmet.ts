import { Graphic } from "@mob/core/models";

/**
 * Helmet model
 */
export class Helmet {
  id: number;
  up: Graphic | number;
  left: Graphic | number;
  down: Graphic | number;
  right: Graphic | number;

  constructor({
    id = 0,
    up = 0,
    left = 0,
    down = 0,
    right = 0,
  }) {
    this.id = id;
    this.up = up;
    this.left = left;
    this.down = down;
    this.right = right;
  }
}
