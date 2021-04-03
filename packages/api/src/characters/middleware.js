import {
  validateFind,
  validateFindOne,
  validateInventory,
} from './validator'

import * as characters from './controller'

export const find = async (req, res, next) => {
  try {
    const params = validateFind(req)
    const user = req.user

    const response = await characters.find({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const findOne = async (req, res, next) => {
  try {
    const params = validateFindOne(req)
    const user = req.user

    const response = await characters.findOne({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const inventory = async (req, res, next) => {
  try {
    const params = validateInventory(req)
    const user = req.user

    const response = await characters.inventory({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}
