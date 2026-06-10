import { Schema, type } from '@colyseus/schema';

export class MapNpcEntityState extends Schema {
  @type('string')
  public id = '';

  @type('uint16')
  public npcId = 0;

  @type('uint16')
  public graphicId = 0;

  @type('int32')
  public x = 0;

  @type('int32')
  public y = 0;
}

export class MapObjectEntityState extends Schema {
  @type('string')
  public id = '';

  @type('uint16')
  public objectId = 0;

  @type('uint16')
  public graphicId = 0;

  @type('uint16')
  public amount = 1;

  @type('int32')
  public x = 0;

  @type('int32')
  public y = 0;
}
