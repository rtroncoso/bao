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

const hydrateCharacterFromPresence = (item: unknown): CharacterState => {
  if (item instanceof CharacterState) {
    return item.clone();
  }

  if (!item || typeof item !== 'object') {
    throw new ServerError(500, 'INVALID_PRESENCE_CHARACTER');
  }

  const data = item as Partial<CharacterState> & {
    tile?: { x?: number; y?: number };
  };

  const character = new CharacterState();
  character.id = data.id;
  character.sessionId = data.sessionId;
  character.name = data.name;
  character.bodyId = data.bodyId;
  character.headId = data.headId;
  character.mapId = data.mapId ?? character.mapId;
  character.heading = data.heading ?? character.heading;
  character.x = data.x ?? character.x;
  character.y = data.y ?? character.y;
  character.worldX = data.worldX ?? character.worldX;
  character.worldY = data.worldY ?? character.worldY;

  if (data.tile) {
    character.tile.x = data.tile.x ?? 0;
    character.tile.y = data.tile.y ?? 0;
  }

  return character;
};

export class OnJoinCommand extends Command<ChatRoom, OnJoinParameters> {
  async execute({ client, options }: OnJoinParameters) {
    const [item] = await this.room.presence.smembers(
      `session:${options.sessionId}`
    );

    if (!item) {
      throw new ServerError(404, 'CHARACTER_NOT_IN_WORLD');
    }

    const character = hydrateCharacterFromPresence(item);
    this.room.characters.push(character);
    this.room.characterByChatSession.set(client.sessionId, character);
  }
}
