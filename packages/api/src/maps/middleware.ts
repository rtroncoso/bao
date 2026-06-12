import type { ApiRequestHandler } from '@bao/types'

import * as maps from './controller'
import { validateFind, validateFindOne } from './validator'

export const find: ApiRequestHandler = async (req, res, next) => {
  try {
    const params = validateFind(req)
    const response = await maps.find(params)
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const findOne: ApiRequestHandler = async (req, res, next) => {
  try {
    const params = validateFindOne(req)
    const response = await maps.findOne(params)
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const findSpawns: ApiRequestHandler = async (req, res, next) => {
  try {
    const params = validateFindOne(req)
    const response = await maps.findSpawns(params)
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}
