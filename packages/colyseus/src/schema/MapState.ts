import { ArraySchema, Schema, type } from '@colyseus/schema';

import {
  MapNpcEntityState,
  MapObjectEntityState
} from '@/schema/MapEntityState';

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
  @type('uint16')
  public mapId = 0;

  @type('string')
  public sessionId?: string;

  @type('string')
  public name?: string;

  @type('uint8')
  public musicId = 0;

  @type([MapNpcEntityState])
  public npcs = new ArraySchema<MapNpcEntityState>();

  @type([MapObjectEntityState])
  public objects = new ArraySchema<MapObjectEntityState>();
}
