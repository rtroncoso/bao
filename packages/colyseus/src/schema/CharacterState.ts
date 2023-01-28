import { TilePosition } from '@/schema/MapState';
import { ArraySchema, Schema, type } from '@colyseus/schema';
import { TILE_SIZE } from '@bao/core';

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
  public speed = 64;

  @type('uint16')
  public bodyId?: number;

  @type('uint16')
  public headId?: number;

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

  moveTo(person: TilePosition): void;
  moveTo(x: number, y: number): void;

  moveTo(...args: unknown[]) {
    const [tile] = args;
    const [x, y] = args;

    if (tile instanceof TilePosition) {
      this.tile.x = tile.x;
      this.tile.y = tile.y;
    }

    if (typeof x === 'number' && typeof y === 'number') {
      this.tile.x = x;
      this.tile.y = y;
    }

    this.x = this.tile.x * TILE_SIZE;
    this.y = this.tile.y * TILE_SIZE;
  }
}
