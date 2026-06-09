import type {
  AuthenticatedRequest,
  ObjectFindOneQuery,
  ObjectFindQuery,
} from '@bao/types'

export const validateFind = (req: AuthenticatedRequest): ObjectFindQuery => {
  const ids = req.query.ids ? String(req.query.ids).split(',') : null

  return {
    ids,
  }
}

export const validateFindOne = (
  req: AuthenticatedRequest
): ObjectFindOneQuery => {
  const id = req.params.id

  return {
    id,
  }
}
