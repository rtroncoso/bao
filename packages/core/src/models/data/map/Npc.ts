/**
 * Npc class
 *
 * @property {number} id
 * @property {number} map
 * @property {number} x
 * @property {number} y
 */
export class Npc {
  id: number;
  map: number;
  x: number;
  y: number;

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
