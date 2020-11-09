import { Client } from 'colyseus';
import { Command } from '@colyseus/command';

import { WorldRoomState } from '@mob/server/schema/WorldRoomState';

export interface OnLeaveParameters {
  client: Client;
}

export class OnLeaveCommand extends Command<WorldRoomState, OnLeaveParameters> {
  execute({ client }: OnLeaveParameters) {
    if (this.state.players.hasOwnProperty(client.sessionId)) {
      this.state.players.delete(client.sessionId);
    }
  }
}
