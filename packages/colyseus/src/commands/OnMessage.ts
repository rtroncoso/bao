import { Client } from 'colyseus';
import { Command } from '@colyseus/command';

import { ChatRoom } from '@bao/server/rooms';

export interface OnMessageParameters {
  message: string;
  client: Client;
}

export class OnMessageCommand extends Command<ChatRoom, OnMessageParameters> {
  async execute({ client, message }: OnMessageParameters) {
    const { characters } = this.room;
    const character = characters.find(
      (item) => item.sessionId === client.sessionId
    );
    this.room.broadcastMessage({ message, character });
  }
}
