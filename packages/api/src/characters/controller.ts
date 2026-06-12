import type {
  CharacterFindOneParams,
  CharacterFindParams,
  CharacterInventoryParams,
  CharacterUpdatePositionParams,
} from '@bao/types'

import * as ObjectModel from './model'

export const find = async ({ ids, accountId }: CharacterFindParams = {}) => {
  return ObjectModel.find({ ids, accountId })
}

export const findOne = async ({ id }: CharacterFindOneParams = {}) => {
  return ObjectModel.findOne({ id })
}

export const inventory = async ({
  characterId,
}: CharacterInventoryParams = {}) => {
  return ObjectModel.inventory({ characterId })
}

export const updatePosition = async ({
  id,
  accountId,
  mapId,
  x,
  y,
  worldX,
  worldY,
}: CharacterUpdatePositionParams) => {
  return ObjectModel.updatePosition({
    id,
    accountId,
    mapId,
    x,
    y,
    worldX,
    worldY,
  })
}
