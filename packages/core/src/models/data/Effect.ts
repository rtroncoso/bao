/**
 * Effect model
 * @param {number} id
 * @param {Graphic|number} animation
 * @param {number} offsetX
 * @param {number} offsetY
 * @exports Effect
 */
export default class Effect {
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
