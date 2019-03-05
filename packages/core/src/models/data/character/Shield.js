/**
 * Shield model
 * @param {number} id
 * @param {Graphic|number} up
 * @param {Graphic|number} left
 * @param {Graphic|number} down
 * @param {Graphic|number} right
 * @exports Shield
 */
export default class Shield {
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
