import * as model from './model'
import jwt from 'jsonwebtoken'

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
  username
} = {}) => {
  const result = await model.findOne({
    id,
    username
  })

  if (!result) {
    throw new Error('NOT_FOUND');
  }

  return result;
}

export const login = async ({
  username,
  password
} = {}) => {

  const account = await model.findOne({
    username: username.toLowerCase()
  })

  if (!account) {
    throw new Error("NOT_FOUND");
  }

  if (account.password != password) {
    throw new Error("Quien sos papá?");
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
