export default class Body {
  /**
   * Body model
   * @param {number} id
   * @param {number|Graphic} up
   * @param {number|Graphic} left
   * @param {number|Graphic} down
   * @param {number|Graphic} right
   * @param {number} headOffsetX
   * @param {number} headOffsetY
   */
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
