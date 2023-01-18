import { Client, ServerError } from 'colyseus';
import { Command } from '@colyseus/command';

import { CharacterState } from '@mob/server/schema/CharacterState';
import { AccountService } from '@mob/server/services/AccountService';
import { WorldRoom } from 'src/rooms/WorldRoom';
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
        (c: any) => c.id === options.characterId
      );

      if (!apiCharacter) {
        throw {
          code: 403,
          message: 'INVALID_VALUE',
          payload: 'ACCOUNT.CHARACTER_ID'
        };
      }

      const character = new CharacterState();
      character.id = apiCharacter.id;
      character.name = apiCharacter.name;
      character.sessionId = client.sessionId;
      this.state.characters.set(client.sessionId, character);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ServerError(parseInt(error.code, 10) || 500, error.message);
      }
    }
  }
}
