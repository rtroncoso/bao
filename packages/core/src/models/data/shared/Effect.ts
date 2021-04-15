import { Graphic } from "@mob/core/models";

/**
 * Effect model
 * @param {number} id
 * @param {Graphic|number} animation
 * @param {number} offsetX
 * @param {number} offsetY
 * @exports Effect
 */
export class Effect {
  id: number;
  animation: Graphic | number;
  offsetX: number;
  offsetY: number;
  constructor({
    id = 0,
    animation = 0,
    offsetX = 0,
    offsetY = 0
  }) {
    this.id = id;
    this.animation = animation;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }
}
