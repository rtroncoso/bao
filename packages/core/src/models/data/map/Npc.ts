/**
 * Npc class
 * @property {number} id
 * @property {number} x
 * @property {number} y
 */
export default class Npc {
  constructor({
    id = 0,
    x = 0,
    y = 0,
  }) {
    this.id = id;
    this.map = id;
    this.x = x;
    this.y = y;
  }
}
