/**
 * TileExit class
 */
export class TileExit {
  x: number;
  y: number;
  map: number;

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
