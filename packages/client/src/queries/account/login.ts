import { QueryConfig } from 'redux-query';

import { merge } from '@bao/client/queries/shared';
import {
  AccountEntities,
  CharacterEntity,
  CharacterModel,
  LoginRequestPayload,
  LoginSuccessResponse
} from './models';

export const loginQuery = {
  cache: false,
  force: true,
  options: {
    method: 'POST'
  },
  queryKey: 'login:POST',
  url: `${process.env.NEXT_PUBLIC_BAO_API}/accounts/login`
};

export const transformLoginResponse = (responseBody: LoginSuccessResponse) => {
  const account = responseBody.account;
  const token = responseBody.token;
  const characters = account.characters?.reduce<CharacterEntity>(
    (acc, character: CharacterModel) => {
      acc[character.id] = character;
      return acc;
    },
    {}
  );
  delete account.characters;
  account.token = token;

  return {
    account,
    characters,
    token
  };
};

const login = (body: LoginRequestPayload): QueryConfig<AccountEntities> => {
  return {
    ...loginQuery,
    body,
    transform: transformLoginResponse,
    update: {
      account: merge,
      characters: merge
    }
  };
};

export default login;
