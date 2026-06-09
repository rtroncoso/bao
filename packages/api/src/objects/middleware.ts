import type { ApiRequestHandler } from '@bao/types'

import * as objects from './controller'
import { validateFind, validateFindOne } from './validator'

export const find: ApiRequestHandler = async (req, res, next) => {
  try {
    const params = validateFind(req)
    const user = req.user

    const response = await objects.find({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const findOne: ApiRequestHandler = async (req, res, next) => {
  try {
    const params = validateFindOne(req)
    const user = req.user

    const response = await objects.findOne({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}
