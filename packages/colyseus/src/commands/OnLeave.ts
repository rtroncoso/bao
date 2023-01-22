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
      const index = this.state.characters.findIndex(
        (character) => character.sessionId === client.sessionId
      );

      if (index !== -1) {
        this.state.characters.splice(index);
      }
    }
  }
}
