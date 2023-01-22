import * as ObjectModel from './model'

export const find = async ({
  ids,
  // name,
  // transaction,
  // user
} = {}) => {
  const result = await ObjectModel.find({
    ids,
  })

  return result
}

export const findOne = async ({ id } = {}) => {
  const result = await ObjectModel.findOne({
    id,
  })

  return result
}
