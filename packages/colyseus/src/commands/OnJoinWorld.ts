import { Client, ServerError } from 'colyseus';
import { Command } from '@colyseus/command';
import jwt from 'jsonwebtoken';
import axios from 'axios';

import { clampPlayableTile } from '@bao/core/loaders/maps/coords';
import { toWorldTile } from '@bao/core/loaders/maps/world';

import { CharacterState } from '@bao/server/schema/CharacterState';
import { AccountService } from '@bao/server/services/AccountService';
import { config } from '@/config';
import { WorldsLoader } from '@/services/WorldsLoader';
import { WorldRoom } from '@/rooms/WorldRoom';

export interface OnJoinOptions {
  characterId: string | number;
  token?: string;
}

export interface OnJoinParameters {
  client: Client;
  options: OnJoinOptions;
  auth: jwt.JwtPayload | string;
}

const DEFAULT_MAP_ID = 34;
const DEFAULT_SPAWN_X = 50;
const DEFAULT_SPAWN_Y = 50;
const PLAYABLE_WIDTH = 84;

const worldsLoader = new WorldsLoader();

const resolveWorldTile = (
  apiCharacter: {
    mapId?: number;
    world?: number;
    x?: number;
    y?: number;
    worldX?: number;
    worldY?: number;
  },
  mapId: number,
  x: number,
  y: number
) => {
  if (apiCharacter.worldX !== undefined && apiCharacter.worldY !== undefined) {
    return {
      worldX: apiCharacter.worldX,
      worldY: apiCharacter.worldY
    };
  }

  const worlds = worldsLoader.load();
  if (worlds) {
    return toWorldTile(mapId, x, y, worlds);
  }

  return {
    worldX: mapId * PLAYABLE_WIDTH + x,
    worldY: y
  };
};

function getAccountId(auth: jwt.JwtPayload | string): number | undefined {
  if (typeof auth !== 'object' || auth === null) {
    return undefined;
  }

  const id = auth.id;
  if (id === undefined || id === null) {
    return undefined;
  }

  const parsed = Number(id);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function toJoinServerError(error: unknown): ServerError {
  if (error instanceof ServerError) {
    return error.message ? error : new ServerError(error.code, 'JOIN_FAILED');
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    const message =
      (typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        String((data as { message?: string }).message || '')) ||
      (typeof data === 'string' && data.slice(0, 200)) ||
      error.message ||
      `API request failed (${config.apiBaseUrl})`;

    console.error('[OnJoinWorld] API error:', status, message);
    return new ServerError(status, message);
  }

  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  ) {
    return new ServerError(
      Number((error as { code: number }).code) || 500,
      String((error as { message: string }).message || 'JOIN_FAILED')
    );
  }

  const message =
    error instanceof Error ? error.message || 'JOIN_FAILED' : 'JOIN_FAILED';
  console.error('[OnJoinWorld] unexpected error:', error);
  return new ServerError(500, message);
}

export class OnJoinCommand extends Command<WorldRoom, OnJoinParameters> {
  async execute({ client, options, auth }: OnJoinParameters) {
    try {
      const accountId = getAccountId(auth);

      if (!accountId) {
        throw new ServerError(422, 'INVALID_VALUE');
      }

      const characterId = parseInt(String(options.characterId), 10);
      if (Number.isNaN(characterId)) {
        throw new ServerError(422, 'INVALID_VALUE');
      }

      console.log(
        `[OnJoinWorld] joining account=${accountId} character=${characterId}`
      );

      const accountService = new AccountService({
        authToken: options.token
      });
      const account = await accountService.findOne(accountId);

      if (!account || typeof account !== 'object') {
        throw new ServerError(502, 'INVALID_API_RESPONSE');
      }

      const apiCharacter = (account.characters || []).find(
        (c: {
          id: number;
          mapId?: number;
          world?: number;
          x?: number;
          y?: number;
          worldX?: number;
          worldY?: number;
        }) => c.id === characterId
      );

      if (!apiCharacter) {
        throw new ServerError(403, 'INVALID_VALUE');
      }

      if (this.state.getCharacter(client.sessionId)) {
        throw new ServerError(409, 'USER_LOGGED_IN');
      }

      const mapId = apiCharacter.mapId ?? apiCharacter.world ?? DEFAULT_MAP_ID;
      const spawn = clampPlayableTile(
        apiCharacter.x ?? DEFAULT_SPAWN_X,
        apiCharacter.y ?? DEFAULT_SPAWN_Y
      );
      const { x, y } = spawn;
      const { worldX, worldY } = resolveWorldTile(apiCharacter, mapId, x, y);

      const character = new CharacterState();
      character.id = apiCharacter.id;
      character.name = apiCharacter.name;
      character.bodyId = apiCharacter.body;
      character.headId = apiCharacter.head;
      character.sessionId = client.sessionId;
      character.mapId = mapId;
      character.worldX = worldX;
      character.worldY = worldY;
      character.moveTo(x, y);

      this.room.accountIdBySession.set(client.sessionId, accountId);
      if (options.token) {
        this.room.authTokenBySession.set(client.sessionId, options.token);
      }

      await this.room.mapRegistry.ensureMapsInInterest(
        mapId,
        x,
        y,
        options.token
      );
      this.room.mapRegistry.registerCharacter(mapId);
      this.state.characters.push(character);
      this.room.movementSystem.noteMapInterest(character);
      await this.room.presence.sadd(`session:${client.sessionId}`, character);
    } catch (error) {
      throw toJoinServerError(error);
    }
  }
}
