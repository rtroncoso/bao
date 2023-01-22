import { Client } from 'colyseus';
import { Command } from '@colyseus/command';

import { WorldRoom } from 'src/rooms/WorldRoom';

export interface OnLeaveParameters {
  client: Client;
}

export class OnLeaveCommand extends Command<WorldRoom, OnLeaveParameters> {
  execute({ client }: OnLeaveParameters) {
    if (
      Object.prototype.hasOwnProperty.call(
        this.state.characters,
        client.sessionId
      )
    ) {
      this.state.characters.delete(client.sessionId);
    }
  }
}
