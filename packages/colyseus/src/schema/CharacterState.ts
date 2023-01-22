import { TilePosition } from '@/schema/MapState';
import { ArraySchema, Schema, type } from '@colyseus/schema';

export class CharacterState extends Schema {
  @type('int32')
  public id?: number;

  @type('string')
  public sessionId?: string;

  @type('string')
  public name?: string;

  @type('uint8')
  public heading = 0;

  @type('uint8')
  public speed = 32;

  @type(TilePosition)
  public tile = new TilePosition();

  @type(TilePosition)
  public targetTile?: TilePosition = null;

  @type('boolean')
  public isMoving = false;

  @type('float32')
  public x = 0;

  @type('float32')
  public y = 0;

  @type(['string'])
  public inputs = new ArraySchema<string>();
}
