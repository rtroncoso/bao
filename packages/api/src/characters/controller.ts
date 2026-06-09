import type {
  CharacterFindOneParams,
  CharacterFindParams,
  CharacterInventoryParams,
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
