import { ArraySchema, MapSchema, Schema, type } from '@colyseus/schema';
import { CharacterState } from '@bao/server/schema/CharacterState';
import { MapState } from '@bao/server/schema/MapState';

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
