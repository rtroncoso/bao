import db from '../db'
import Qb from '../queryBuilder'

export const find = async ({
  ids
} = {}) => {

	var qb = new Qb();
	qb.select('*');
	qb.from('objects');

	if(ids){
		qb.where_in('id', ids);
	}

	var sql = await qb.get();
	const objects = await db.executeQuery(sql);

	const objects_ids = objects.map(object => object.id);

	var qb = new Qb();
	qb.select('attributes.name, attributes.id, oa.value, oa.object_id');
	qb.from('objects_attributes oa');
	qb.join('attributes', 'attributes.id = oa.attribute_id', 'inner');
	qb.where_in('oa.object_id', objects_ids);

	var sql = await qb.get();
	var object_attributes = await db.executeQuery(sql);

	const response = objects.map(object => {
		var attributes = object_attributes
		.filter(attribute => attribute.object_id === object.id)
		.map(attribute => ({
			id: attribute.id,
			name: attribute.name,
			value: attribute.value
		}));
		return {
			...object,
			attributes
		}
	});

	return response;
}

export const findOne = async ({
  id
} = {}) => {
	const [result] = await find({ids: [id]});
	return result;
}