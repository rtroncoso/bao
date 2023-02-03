import { Client } from 'colyseus';
import { Command } from '@colyseus/command';

import { ChatRoom } from '@bao/server/rooms';
import { CharacterState } from '@bao/server/schema/CharacterState';

export interface OnJoinOptions {
  account: any;
  characterId: string;
}

export interface OnJoinParameters {
  client: Client;
  options: OnJoinOptions;
}

export class OnJoinCommand extends Command<ChatRoom, OnJoinParameters> {
  async execute({ client, options }: OnJoinParameters) {
    const key = `character:${options.characterId}`;
    const [item] = await this.room.presence.smembers(key);

    // TODO : dirty hack
    const character = (item as unknown as CharacterState).clone();
    character.sessionId = client.sessionId;
    this.room.characters.push(character);
  }
}
