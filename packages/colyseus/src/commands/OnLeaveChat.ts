import { Client } from 'colyseus';
import { Command } from '@colyseus/command';
import { ChatRoom } from '@/rooms/ChatRoom';

export interface OnLeaveParameters {
  client: Client;
}

export class OnLeaveCommand extends Command<ChatRoom, OnLeaveParameters> {
  execute({ client }: OnLeaveParameters) {
    const { characters } = this.room;
    const index = characters.findIndex(
      (item) => item.sessionId === client.sessionId
    );

    if (index !== -1) {
      characters.splice(index, 1);
    }
  }
}
