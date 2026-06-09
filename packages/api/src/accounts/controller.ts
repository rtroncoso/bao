import type {
  AccountFindParams,
  AccountFindOneParams,
  AccountRow,
  AuthenticatedAccountResponse,
  JwtAccountPayload,
  LoginParams,
  LoginResponse,
  TokenParams,
} from '@bao/types'
import { createApiError } from '@bao/types'
import jwt from 'jsonwebtoken'

import { jwtSecret } from '../config'
import * as characterController from '../characters/controller'
import * as model from './model'

export const find = async ({ ids }: AccountFindParams = {}) => {
  return model.find({ ids })
}

export const findOne = async ({
  id,
  username,
  showPassword = false,
}: AccountFindOneParams = {}): Promise<AuthenticatedAccountResponse> => {
  const account = await model.findOne({ id, username })

  if (!account) {
    throw new Error('NOT_FOUND')
  }

  const characters = await characterController.find({ accountId: id })

  const response: AuthenticatedAccountResponse = { ...account, characters }

  if (!showPassword) {
    delete response.password
  }

  return response
}

export const login = async ({
  username,
  password,
}: LoginParams): Promise<LoginResponse> => {
  const account = await findOne({
    username: username.toLowerCase(),
    showPassword: true,
  })

  if (account.password !== password) {
    throw createApiError('INVALID_VALUE', 'ACCOUNT.PASSWORD')
  }

  delete account.password

  const token = generateToken({ id: account.id })
  return { account, token }
}

export const getAccountFromToken = async ({
  token,
}: TokenParams): Promise<JwtAccountPayload> => {
  return jwt.verify(token, jwtSecret) as JwtAccountPayload
}

function generateToken({ id }: Pick<AccountRow, 'id'>): string {
  return jwt.sign({ id }, jwtSecret)
}
