import { Client } from 'colyseus';
import { Command } from '@colyseus/command';
import { WorldRoom } from '@/rooms/WorldRoom';

export interface OnLeaveParameters {
  client: Client;
}

export class OnLeaveCommand extends Command<WorldRoom, OnLeaveParameters> {
  async execute({ client }: OnLeaveParameters) {
    const index = this.state.characters.findIndex(
      (character) => character.sessionId === client.sessionId
    );

    if (index === -1) {
      return;
    }

    const character = this.state.characters[index];
    const accountId = this.room.accountIdBySession.get(client.sessionId);

    if (accountId) {
      try {
        await this.room.mapTransitionSystem.persistPosition(
          character,
          accountId
        );
      } catch (error) {
        console.error('[OnLeaveWorld] failed to persist position:', error);
      }
    }

    this.room.mapRegistry.unregisterCharacter(character.mapId);
    this.room.movementSystem.unblockCharacter(character);
    this.state.characters.splice(index, 1);
    if (character.id) {
      this.room.presence.srem(`character:${character.id}`, character);
    }
    this.room.accountIdBySession.delete(client.sessionId);
    this.room.authTokenBySession.delete(client.sessionId);
  }
}
