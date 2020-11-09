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

	// Attributes

	var qb = new Qb();
	qb.select('attributes.name, attributes.id, oa.value, oa.object_id');
	qb.from('objects_attributes oa');
	qb.join('attributes', 'attributes.id = oa.attribute_id', 'inner');
	qb.where_in('oa.object_id', objects_ids);

	var sql = await qb.get();
	var object_attributes = await db.executeQuery(sql);

	// Classes

	var qb = new Qb();
	qb.select('classes.name, classes.id, oc.class_id, oc.object_id');
	qb.from('objects_classes oc');
	qb.join('classes', 'classes.id = oc.class_id', 'inner');
	qb.where_in('oc.object_id', objects_ids);

	var sql = await qb.get();
	var object_classes = await db.executeQuery(sql);

	console.log("--object_classes", object_classes);

	// Response

	const response = objects.map(object => {

		// Attributes

		var attributes = object_attributes
		.filter(attribute => attribute.object_id === object.id)
		.map(attribute => ({
			id: attribute.id,
			name: attribute.name,
			value: attribute.value
		}));

		object.attributes = attributes;

		// Classes

		var classes = object_classes
		.filter(objclass => objclass.object_id === object.id)
		.map(objclass => ({
			id: objclass.id,
			name: objclass.name
		}));
		
		return {
			...object,
			attributes,
			classes
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