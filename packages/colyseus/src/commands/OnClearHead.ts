import { Client } from 'colyseus';
import { Command } from '@colyseus/command';

import { ChatRoom } from '@bao/server/rooms';

export interface OnClearHeadParameters {
  client: Client;
}

export class OnClearHeadCommand extends Command<
  ChatRoom,
  OnClearHeadParameters
> {
  async execute({ client }: OnClearHeadParameters) {
    const character = this.room.characterByChatSession.get(client.sessionId);
    if (!character) {
      return;
    }

    this.room.broadcast('clearHead', {
      character,
      timestamp: Date.now()
    });
  }
}
