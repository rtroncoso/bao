import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { CharacterState } from '@mob/server/schema/CharacterState';
import { MapState } from '@mob/server/schema/MapState';

export class WorldRoomState extends Schema {
  @type([CharacterState])
  public characters = new ArraySchema<CharacterState>();

  @type({ map: MapState })
  public maps = new MapSchema<MapState>();

  public getCharacter(sessionId: string) {
    return this.characters.find(
      (character) => sessionId === character.sessionId
    );
  }
}
