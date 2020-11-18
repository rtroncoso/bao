import { Client, ServerError } from 'colyseus';
import { Command } from '@colyseus/command';

import { CharacterState } from '@mob/server/schema/CharacterState';
import { WorldRoomState } from '@mob/server/schema/WorldRoomState';
import { AccountService } from '@mob/server/services/AccountService';

export interface OnJoinOptions {
  account: any;
  characterId: string | number;
}

export interface OnJoinParameters {
  client: Client;
  options: OnJoinOptions;
}

export class OnJoinCommand extends Command<WorldRoomState, OnJoinParameters> {
  accountService: AccountService = new AccountService();
  async execute({ client, options }: OnJoinParameters) {
    try {
      if (!options.account) {
        throw {
          code: 422,
          message: 'INVALID_VALUE',
          payload: 'ACCOUNT'
        }
      }

      const account = await this.accountService.findOne(options.account.id);
      const apiCharacter = (account.characters || [])
        .find((c: any) => c.id === options.characterId)

      if (!apiCharacter) {
        throw {
          code: 403,
          message: 'INVALID_VALUE',
          payload: 'ACCOUNT.CHARACTER_ID'
        }
      }

      const character = new CharacterState();
      character.id = apiCharacter.id;
      character.name = apiCharacter.name;
      character.sessionId = client.sessionId;
      this.state.characters.set(client.sessionId, character);
    } catch (error) {
      throw new ServerError(error.code || 500, error.message);
    }
  }
}
