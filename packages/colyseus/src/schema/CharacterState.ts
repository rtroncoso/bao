import { Schema, type } from '@colyseus/schema';

export class CharacterState extends Schema {
  @type('int32')
  public id: number;

  @type('string')
  public sessionId: string;

  @type('string')
  public name: string;

  @type('int32')
  public x: number = 300;

  @type('int32')
  public y: number = 300;
}
