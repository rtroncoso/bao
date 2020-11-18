import { Client } from 'colyseus';
import { Command } from '@colyseus/command';

import { WorldRoomState } from '@mob/server/schema/WorldRoomState';

export interface OnLeaveParameters {
  client: Client;
}

export class OnLeaveCommand extends Command<WorldRoomState, OnLeaveParameters> {
  execute({ client }: OnLeaveParameters) {
    if (this.state.characters.hasOwnProperty(client.sessionId)) {
      this.state.characters.delete(client.sessionId);
    }
  }
}
