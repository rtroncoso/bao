import { Schema, type } from '@colyseus/schema';

export class MapState extends Schema {
  @type('string')
  public sessionId?: string;

  @type('string')
  public name?: string;
}
