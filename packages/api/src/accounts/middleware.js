import {
  validateFind,
  validateFindOne,
  validateLogin,
  validateToken
} from './validator'

import * as accounts from './controller'

export const find = async (req, res, next) => {
  try {
    const params = validateFind(req)
    const user = req.user

    const response = await accounts.find({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const findOne = async (req, res, next) => {
  try {
    const params = validateFindOne(req)
    const user = req.user

    const response = await accounts.findOne({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const params = validateLogin(req)
    const user = req.user

    const response = await accounts.login({ ...params, user })
    return res.send(response)
  } catch (err) {
    return next(err)
  }
}

export const getAccountFromToken = async (req, res, next) => {
  try {
    const params = validateToken(req)
    const accountFromToken = await accounts.getAccountFromToken({ ...params})
    const account = await accounts.findOne({id: accountFromToken.id})

    req.account = account;
    next();
  } catch (err) {

    if(err.name == 'JsonWebTokenError'){
      return next(new Error("NOT_AUTHORIZED"));
    }

    next(err)
  }
}