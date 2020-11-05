import db from '../db'
import Qb from '../queryBuilder'

export const find = async ({
  ids,
  username
} = {}) => {

	var qb = new Qb();
	qb.select('*');
	qb.from('accounts');

	console.log("ids", ids);

	if(ids !== undefined){
		qb.where_in('id', ids);
	}

	if(username){
		qb.where('username', username);
	}

	var sql = await qb.get();
	const response = await db.executeQuery(sql);
	return response;
}

export const findOne = async ({
  id,
  username,
  password
} = {}) => {

	const ids = id ? [id] : undefined;

	const [result] = await find({
		ids,
		username
	});

	return result;
}