import { Client } from 'colyseus';
import { Command } from '@colyseus/command';

import { WorldRoomState } from '@mob/server/schema/WorldRoomState';

export type Heading = 'north' | 'east' | 'south' | 'west';

export interface MoveParameters {
  heading: Heading;
}

export interface OnMoveParameters {
  client: Client;
  heading: Heading;
}

export class OnMoveCommand extends Command<WorldRoomState, OnMoveParameters> {
  execute({ client, heading }: OnMoveParameters) {
    const character = this.state.characters.get(client.sessionId);

    switch (heading) {
      case 'north': {
        character.y -= 1;
        break;
      }
      case 'east': {
        character.x += 1;
        break;
      }
      case 'south': {
        character.y += 1;
        break;
      }
      case 'west': {
        character.x -= 1;
        break;
      }
    }
  }
}
