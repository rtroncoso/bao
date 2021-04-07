import { ArraySchema, Schema, type } from '@colyseus/schema';

export class CharacterState extends Schema {
  @type('int32')
  public id?: number;

  @type('string')
  public sessionId?: string;

  @type('string')
  public name?: string;

  @type('float32')
  public x: number = 0;

  @type('float32')
  public y: number = 0;

  @type(['string'])
  public inputs = new ArraySchema<string>();
}
