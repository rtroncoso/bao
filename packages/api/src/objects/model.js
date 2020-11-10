import db from '../db'
import { QueryBuilder } from '../queryBuilder'

export const find = async ({
  ids
} = {}) => {
  const qb = new QueryBuilder()
  qb.select('*')
  qb.from('objects')

  if (ids) {
    qb.whereIn('id', ids)
  }

  const objectsSql = await qb.get()
  const objects = await db.executeQuery(objectsSql)
  const objectIds = objects.map(object => object.id)

  qb.reset()
  qb.select('attributes.name, attributes.id, oa.value, oa.object_id AS objectId')
  qb.from('objects_attributes oa')
  qb.join('attributes', 'attributes.id = oa.attribute_id', 'inner')
  qb.whereIn('oa.object_id', objectIds)

  // Attributes

  qb.reset()
  qb.select('attributes.name, attributes.id, oa.value, oa.object_id AS objectId')
  qb.from('objects_attributes oa')
  qb.join('attributes', 'attributes.id = oa.attribute_id', 'inner')
  qb.whereIn('oa.object_id', objects_ids)

  const objectAttributesSql = await qb.get()
  const objectAttributes = await db.executeQuery(objectAttributesSql)

  // Classes

  qb.reset()
  qb.select('classes.name, classes.id, oc.class_id AS classId, oc.object_id AS objectId')
  qb.from('objects_classes oc')
  qb.join('classes', 'classes.id = oc.class_id', 'inner')
  qb.whereIn('oc.object_id', objects_ids)

  const objectClassesSql = await qb.get()
  const objectClasses = await db.executeQuery(objectClassesSql)

  console.log("--objectClasses", objectClasses)

  // Response
  const response = objects.map(object => {
    // Attributes
    const attributes = objectAttributes
      .filter(attribute => attribute.objectId === object.id)
      .map(attribute => ({
        id: attribute.id,
        name: attribute.name,
        value: attribute.value
      }))

    object.attributes = attributes

    // Classes
    const classes = objectClasses
      .filter(objectClass => objectClass.objectId === object.id)
      .map(objectClass => ({
        id: objectClass.id,
        name: objectClass.name
      }))

    return {
      ...object,
      attributes,
      classes
    }
  })

  return response
}

export const findOne = async ({
  id
} = {}) => {
  const [result] = await find({ ids: [id] })
  return result
}
