/**
 * TileExit class
 * @property {number} x
 * @property {number} y
 * @property {number} map
 */
export default class TileExit {
  constructor({
    x = 0,
    y = 0,
    map = 0,
  }) {
    this.x = x;
    this.y = y;
    this.map = map;
  }
}
