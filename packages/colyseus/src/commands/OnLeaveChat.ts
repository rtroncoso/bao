import { Client } from 'colyseus';
import { Command } from '@colyseus/command';
import { ChatRoom } from '@/rooms/ChatRoom';

export interface OnLeaveParameters {
  client: Client;
}

export class OnLeaveCommand extends Command<ChatRoom, OnLeaveParameters> {
  execute({ client }: OnLeaveParameters) {
    const character = this.room.characterByChatSession.get(client.sessionId);
    if (!character) {
      return;
    }

    const index = this.room.characters.indexOf(character);
    if (index !== -1) {
      this.room.characters.splice(index, 1);
    }

    this.room.characterByChatSession.delete(client.sessionId);
  }
}
