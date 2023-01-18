import * as model from './model'
import jwt from 'jsonwebtoken'
import * as characterController from '../characters/controller'

export const find = async ({
  ids,
  //name,
  //transaction,
  //user
} = {}) => {
  const result = await model.find({
    ids
  })

  return result
}

export const findOne = async ({
	id,
  username,
  showPassword = false
} = {}) => {
  const account = await model.findOne({
    id,
    username
  })

  if (!account) {
    throw new Error('NOT_FOUND');
  }

  const characters = await characterController.find({
    accountId: id
  });

  if(!showPassword){
    delete account.password;
  }

  return {...account, characters};
}

export const login = async ({
  username,
  password
} = {}) => {

  const account = await findOne({
    username: username.toLowerCase(),
    showPassword: true
  })

  if (!account) {
    throw new Error("NOT_FOUND");
  }

  if (account.password !== password) {
    throw {
      message: 'INVALID_VALUE',
      payload: 'Quien sos papá?'
    };
  }

  delete account.password;

  const token = generateToken({id: account.id});
  return {account, token};
}

export const getAccountFromToken = async ({
  token
} = {}) => {
  return jwt.verify(token, process.env.SECRET_KEY)
}

function generateToken({id}){
  return jwt.sign(
    {
      id
    },
    process.env.SECRET_KEY
  )
}
