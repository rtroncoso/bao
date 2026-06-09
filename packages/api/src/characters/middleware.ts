import type { ApiRequestHandler } from '@bao/types'

import * as characters from './controller'
import { validateFind, validateFindOne, validateInventory } from './validator'

export const find: ApiRequestHandler = async (req, res, next) => {
  try {
    const params = validateFind(req)
    const user = req.user

    const response = await characters.find({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const findOne: ApiRequestHandler = async (req, res, next) => {
  try {
    const params = validateFindOne(req)
    const user = req.user

    const response = await characters.findOne({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const inventory: ApiRequestHandler = async (req, res, next) => {
  try {
    const params = validateInventory(req)
    const user = req.user

    const response = await characters.inventory({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}
