import type {
  AuthenticatedRequest,
  CharacterFindOneQuery,
  CharacterFindQuery,
  CharacterInventoryQuery,
  CharacterUpdatePositionBody,
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

export const validateUpdatePosition = (
  req: AuthenticatedRequest
): CharacterUpdatePositionBody => {
  const body = req.body as Partial<CharacterUpdatePositionBody>
  const mapId = Number(body.mapId)
  const x = Number(body.x)
  const y = Number(body.y)
  const worldX = Number(body.worldX)
  const worldY = Number(body.worldY)

  if (
    !Number.isFinite(mapId) ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(worldX) ||
    !Number.isFinite(worldY)
  ) {
    throw new Error('INVALID_VALUE')
  }

  const MAP_WIDTH = 84
  const MAP_HEIGHT = 88

  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
    throw new Error('INVALID_VALUE')
  }

  return { mapId, x, y, worldX, worldY }
}
