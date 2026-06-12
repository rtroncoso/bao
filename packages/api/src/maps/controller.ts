import type { MapFindOneParams, MapFindParams } from '@bao/types'

import * as MapModel from './model'

export const find = async ({ ids }: MapFindParams = {}) => {
  return MapModel.find({ ids })
}

export const findOne = async ({ id }: MapFindOneParams = {}) => {
  return MapModel.findOne({ id })
}

export const findSpawns = async ({ id }: MapFindOneParams = {}) => {
  return MapModel.findSpawns(id)
}
