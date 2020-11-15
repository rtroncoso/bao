import { QueryConfig } from 'redux-query';

import { merge, override } from '@mob/client/queries/shared';
import {
  CharacterEntity,
  CharacterModel,
  LoginEntities,
  LoginRequestParameters,
  LoginSuccessResponse
} from './models';

export const loginQuery = {
  cache: false,
  force: true,
  options: {
    method: 'POST'
  },
  url: `${process.env.MOB_API}/client/accounts/login`,
};

export const transformLoginResponse = (responseBody: LoginSuccessResponse) => {
  const account = responseBody.account;
  const characters = account.characters!
    .reduce<CharacterEntity>((acc, character: CharacterModel) => {
      acc[character.id] = character;
      return acc;
    }, {} as CharacterEntity);
  const token = responseBody.token;
  delete account.characters;

  return {
    account,
    characters,
    token
  }
};

const login = (body: LoginRequestParameters): QueryConfig<LoginEntities> => {
  return {
    ...loginQuery,
    body,
    transform: transformLoginResponse,
    update: {
      account: merge,
      characters: merge,
      token: override
    },
  }
};

export default login;
