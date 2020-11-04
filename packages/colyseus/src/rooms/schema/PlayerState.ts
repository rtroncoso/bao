import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
  @type('string')
  public sessionId: string;

  @type('string')
  public name: string;

  @type('int32')
  public x: number = 500;

  @type('int32')
  public y: number = 500;
}
