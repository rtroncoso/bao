import { Client } from 'colyseus';
import { Command } from '@colyseus/command';

import { ChatRoom } from 'src/rooms';

export interface OnJoinOptions {
  account: any;
  characterId: string | number;
}

export interface OnJoinParameters {
  client: Client;
  options: OnJoinOptions;
}

export class OnJoinCommand extends Command<ChatRoom, OnJoinParameters> {
  async execute({ client, options }: OnJoinParameters) {
    const { characters } = this.room;
    const character = characters.find((item) => {
      item.id === options.characterId;
    });
    if (character) {
      character.sessionId = client.sessionId;
      console.log(character.toJSON(), client.sessionId);
    }
  }
}
