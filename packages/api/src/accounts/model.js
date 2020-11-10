import db from '../db'
import { QueryBuilder } from '../queryBuilder'

export const find = async ({
  ids,
  username
} = {}) => {
  var qb = new QueryBuilder();
  qb.select('*');
  qb.from('accounts');

  if (ids !== undefined) {
    qb.whereIn('id', ids);
  }

  if (username) {
    qb.where('username', username);
  }

  var sql = await qb.get();
  const accounts = await db.executeQuery(sql);

  if(!accounts.length){
    throw new Error("NOT_FOUND");
  }

  return accounts;
}

export const findOne = async ({
  id,
  username
} = {}) => {
  const ids = id ? [id] : undefined;

  const [result] = await find({
    ids,
    username
  });

  return result;
}
