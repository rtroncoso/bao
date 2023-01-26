import { Client, ServerError } from 'colyseus';
import { Command } from '@colyseus/command';

import { CharacterState } from '@bao/server/schema/CharacterState';
import { AccountService } from '@bao/server/services/AccountService';
import { WorldRoom } from '@/rooms/WorldRoom';
import axios, { AxiosError } from 'axios';

export interface OnJoinOptions {
  account: any;
  characterId: string | number;
}

export interface OnJoinParameters {
  client: Client;
  options: OnJoinOptions;
}

export class OnJoinCommand extends Command<WorldRoom, OnJoinParameters> {
  accountService: AccountService = new AccountService();
  async execute({ client, options }: OnJoinParameters) {
    try {
      if (!options.account) {
        throw {
          code: 422,
          message: 'INVALID_VALUE',
          payload: 'ACCOUNT'
        };
      }

      const account = await this.accountService.findOne(options.account.id);
      const apiCharacter = (account.characters || []).find(
        (c: any) => c.id === parseInt(options.characterId as string, 10)
      );

      if (!apiCharacter) {
        throw {
          code: 403,
          message: 'INVALID_VALUE',
          payload: 'ACCOUNT.CHARACTER_ID'
        };
      }

      if (this.state.getCharacter(client.sessionId)) {
        throw {
          code: 409,
          message: 'USER_LOGGED_IN',
          payload: 'ACCOUNT.CHARACTER_ID'
        };
      }

      const character = new CharacterState();
      console.log(apiCharacter);
      character.id = apiCharacter.id;
      character.name = apiCharacter.name;
      character.bodyId = apiCharacter.body;
      character.headId = apiCharacter.head;
      character.sessionId = client.sessionId;
      character.moveTo(50, 50);
      this.state.characters.push(character);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ServerError(parseInt(error.code, 10) || 500, error.message);
      }

      throw new ServerError(error.code, error.message);
    }
  }
}
