import type { NextFunction, Request, Response } from 'express'

import type { AccountPublic } from '../db/accounts'
import type { CharacterWithRelations } from './responses'

export interface AuthenticatedAccount extends AccountPublic {
  characters?: CharacterWithRelations[]
}

export interface AuthenticatedRequest extends Request {
  user?: unknown
  account?: AuthenticatedAccount
}

export type ApiRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void | Response> | void | Response

export type ApiErrorRequestHandler = (
  err: Error,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void
