import * as ObjectModel from './model'

export const find = async ({
  ids,
  accountId,
  // name,
  // transaction,
  // user
} = {}) => {
  const result = await ObjectModel.find({
    ids,
    accountId,
  })

  return result
}

export const findOne = async ({ id } = {}) => {
  const result = await ObjectModel.findOne({
    id,
  })

  return result
}

export const inventory = async ({ characterId } = {}) => {
  const result = await ObjectModel.inventory({
    characterId,
  })

  return result
}
