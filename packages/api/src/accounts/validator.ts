import type {
  AuthenticatedRequest,
  TokenParams,
  AccountFindOneQuery,
  AccountFindQuery,
  LoginBody,
} from '@bao/types'

export const validateFind = (req: AuthenticatedRequest): AccountFindQuery => {
  const ids = req.query.ids ? String(req.query.ids).split(',') : null

  return {
    ids,
  }
}

export const validateFindOne = (
  req: AuthenticatedRequest
): AccountFindOneQuery => {
  const id = req.params.id

  return {
    id,
  }
}

export const validateLogin = (req: AuthenticatedRequest): LoginBody => {
  const username = req.body.username as string | undefined
  const password = req.body.password as string | undefined

  if (!username || !password) {
    throw new Error('MISSING_PARAMS')
  }

  return {
    username,
    password,
  }
}

export const validateToken = (req: AuthenticatedRequest): TokenParams => {
  const token = req.headers['x-auth']

  if (!token || Array.isArray(token)) {
    throw new Error('MISSING_PARAMS')
  }

  return {
    token,
  }
}
