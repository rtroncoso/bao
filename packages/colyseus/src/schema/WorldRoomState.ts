import { MapSchema, Schema, type } from '@colyseus/schema';
import { CharacterState } from '@mob/server/schema/CharacterState';
import { MapState } from '@mob/server/schema/MapState';

export class WorldRoomState extends Schema {
  @type({ map: CharacterState })
  public characters = new MapSchema<CharacterState>();

  @type({ map: MapState })
  public maps = new MapSchema<MapState>();
}
