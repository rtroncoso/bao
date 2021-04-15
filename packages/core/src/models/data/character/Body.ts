import { Graphic } from "@mob/core/models";

/**
 * Body model
 */
export class Body {
  id: number;
  up: Graphic | number;
  left: Graphic | number;
  down: Graphic | number;
  right: Graphic | number;
  headOffsetX: number;
  headOffsetY: number;

  constructor({
    id = 0,
    up = 0,
    left = 0,
    down = 0,
    right = 0,
    headOffsetX = 0,
    headOffsetY = 0
  }) {
    this.id = id;
    this.up = up;
    this.left = left;
    this.down = down;
    this.right = right;
    this.headOffsetX = headOffsetX;
    this.headOffsetY = headOffsetY;
  }
}
