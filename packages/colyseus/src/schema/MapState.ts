import { Schema, type } from '@colyseus/schema';

export class TilePosition extends Schema {
  @type('int32')
  public x = 0;

  @type('int32')
  public y = 0;

  constructor({ x, y }: { x: number; y: number } = { x: 0, y: 0 }) {
    super();
    this.x = x;
    this.y = y;
  }
}

export class MapState extends Schema {
  @type('string')
  public sessionId?: string;

  @type('string')
  public name?: string;
}
