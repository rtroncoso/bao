import {
  validateFind,
  validateFindOne,
} from './validator'

import * as objects from './controller'

export const find = async (req, res, next) => {
  try {
    const params = validateFind(req)
    const user = req.user

    const response = await objects.find({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const findOne = async (req, res, next) => {
  try {
    const params = validateFindOne(req)
    const user = req.user

    const response = await objects.findOne({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}
