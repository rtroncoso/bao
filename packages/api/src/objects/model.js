import db from '../db'
import { QueryBuilder } from '../queryBuilder'

export const find = async ({ ids } = {}) => {
  const qb = new QueryBuilder()
  qb.select('*')
  qb.from('objects')

  if (ids) {
    qb.whereIn('id', ids)
  }

  const objectsSql = qb.get()
  const objects = await db.executeQuery(objectsSql)
  const objectIds = objects.map((object) => object.id)

  if (!objectIds.length) {
    throw new Error('NOT_FOUND')
  }

  // Attributes

  qb.reset()
  qb.select('attributes.name, attributes.id, oa.value, oa.objectId AS objectId')
  qb.from('objects_attributes oa')
  qb.join('attributes', 'attributes.id = oa.attributeId', 'inner')
  qb.whereIn('oa.objectId', objectIds)

  const objectAttributesSql = qb.get()
  const objectAttributes = await db.executeQuery(objectAttributesSql)

  // Classes

  qb.reset()
  qb.select(
    'classes.name, classes.id, oc.classId AS classId, oc.objectId AS objectId'
  )
  qb.from('objects_classes oc')
  qb.join('classes', 'classes.id = oc.classId', 'inner')
  qb.whereIn('oc.objectId', objectIds)

  const objectClassesSql = qb.get()
  const objectClasses = await db.executeQuery(objectClassesSql)

  // console.log("--objectClasses", objectClasses)

  // Response
  const response = objects.map((object) => {
    // Attributes
    const attributes = objectAttributes
      .filter((attribute) => attribute.objectId === object.id)
      .map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        value: attribute.value,
      }))

    // Classes
    const classes = objectClasses
      .filter((objectClass) => objectClass.objectId === object.id)
      .map((objectClass) => ({
        id: objectClass.id,
        name: objectClass.name,
      }))

    return {
      ...object,
      attributes,
      classes,
    }
  })

  return response
}

export const findOne = async ({ id } = {}) => {
  const [result] = await find({ ids: [id] })
  return result
}
