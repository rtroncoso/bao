import { Client } from 'colyseus';
import { Command } from '@colyseus/command';

import { PlayerState } from '../schema/PlayerState';
import { WorldRoomState } from '../schema/WorldRoomState';

export interface OnJoinParameters {
  client: Client;
}

export class OnJoinCommand extends Command<WorldRoomState, OnJoinParameters> {
  execute({ client }: OnJoinParameters) {
    const player = new PlayerState();
    player.name = client.id;
    player.sessionId = client.sessionId;
    this.state.players.set(client.sessionId, player);
  }
}
