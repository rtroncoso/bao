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
    const player = this.state.players.get(client.sessionId);

    switch (heading) {
      case 'north': {
        player.y -= 1;
        break;
      }
      case 'east': {
        player.x += 1;
        break;
      }
      case 'south': {
        player.y += 1;
        break;
      }
      case 'west': {
        player.x -= 1;
        break;
      }
    }
  }
}
