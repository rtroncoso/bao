import type {
  AuthenticatedRequest,
  CharacterFindOneQuery,
  CharacterFindQuery,
  CharacterInventoryQuery,
} from '@bao/types'

export const validateFind = (req: AuthenticatedRequest): CharacterFindQuery => {
  const ids = req.query.ids ? String(req.query.ids).split(',') : null
  const accountId = req.query.accountId ? String(req.query.accountId) : null

  return {
    ids,
    accountId,
  }
}

export const validateFindOne = (
  req: AuthenticatedRequest
): CharacterFindOneQuery => {
  const id = req.params.id

  return {
    id,
  }
}

export const validateInventory = (
  req: AuthenticatedRequest
): CharacterInventoryQuery => {
  const characterId = req.params.id

  return {
    characterId,
  }
}
