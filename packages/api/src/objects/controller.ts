import type { ObjectFindOneParams, ObjectFindParams } from '@bao/types'

import * as ObjectModel from './model'

export const find = async ({ ids }: ObjectFindParams = {}) => {
  return ObjectModel.find({ ids })
}

export const findOne = async ({ id }: ObjectFindOneParams = {}) => {
  return ObjectModel.findOne({ id })
}
