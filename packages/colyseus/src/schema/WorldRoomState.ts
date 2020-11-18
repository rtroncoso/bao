import { MapSchema, Schema, type } from "@colyseus/schema";
import { CharacterState } from './CharacterState';
import { MapState } from './MapState';

export class WorldRoomState extends Schema {
  @type({ map: CharacterState })
  public characters = new MapSchema<CharacterState>();

  @type({ map: MapState })
  public maps = new MapSchema<MapState>();
}
