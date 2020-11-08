import { MapSchema, Schema, type } from "@colyseus/schema";
import { PlayerState } from './PlayerState';
import { MapState } from './MapState';

export class WorldRoomState extends Schema {
  @type({ map: PlayerState })
  public players = new MapSchema<PlayerState>();

  @type({ map: MapState })
  public maps = new MapSchema<MapState>();
}
