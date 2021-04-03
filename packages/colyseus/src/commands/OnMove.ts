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
  public speed: number = 250;
  execute({ client, heading }: OnMoveParameters) {
    const character = this.state.characters.get(client.sessionId);

    switch (heading) {
      case 'north': {
        character.y -= this.speed * (1 / this.clock.deltaTime);
        break;
      }
      case 'east': {
        character.x += this.speed * (1 / this.clock.deltaTime);
        break;
      }
      case 'south': {
        character.y += this.speed * (1 / this.clock.deltaTime);
        break;
      }
      case 'west': {
        character.x -= this.speed * (1 / this.clock.deltaTime);
        break;
      }
    }
  }
}
