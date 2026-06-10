import { Client } from 'colyseus';
import { Command } from '@colyseus/command';
import { WorldRoom } from '@/rooms/WorldRoom';

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
        const character = this.state.characters[index];
        this.state.characters.splice(index, 1);
        this.room.presence.srem(`session:${client.sessionId}`, character);
      }
    }
  }
}
