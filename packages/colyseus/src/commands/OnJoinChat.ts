import { Client, ServerError } from 'colyseus';
import { Command } from '@colyseus/command';
import jwt from 'jsonwebtoken';

import { ChatRoom } from '@bao/server/rooms';
import { CharacterState } from '@bao/server/schema/CharacterState';

export interface OnJoinOptions {
  characterId: string | number;
  sessionId: string;
  token?: string;
}

export interface OnJoinParameters {
  client: Client;
  options: OnJoinOptions;
  auth: jwt.JwtPayload | string;
}

export class OnJoinCommand extends Command<ChatRoom, OnJoinParameters> {
  async execute({ client, options }: OnJoinParameters) {
    const [item] = await this.room.presence.smembers(
      `session:${options.sessionId}`
    );

    if (!item) {
      throw new ServerError(404, 'CHARACTER_NOT_IN_WORLD');
    }

    const character = (item as unknown as CharacterState).clone();
    this.room.characters.push(character);
    this.room.characterByChatSession.set(client.sessionId, character);
  }
}
