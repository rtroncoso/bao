import type {
  NamedEntity,
  ObjectAttributeJoinRow,
  ObjectClassJoinRow,
  ObjectRow,
  ObjectWithRelations,
} from '@bao/types'

import db from '../db'
import { QueryBuilder } from '../queryBuilder'

interface ObjectFindOptions {
  ids?: Array<number | string>
}

interface ObjectFindOneOptions {
  id?: number | string
}

export const find = async ({ ids }: ObjectFindOptions = {}): Promise<
  ObjectWithRelations[]
> => {
  const qb = new QueryBuilder()
  qb.select('*')
  qb.from('objects')

  if (ids) {
    qb.whereIn('id', ids)
  }

  const objectsSql = qb.get()
  const objects = await db.executeQuery<ObjectRow>(objectsSql)
  const objectIds = objects.map((object) => object.id)

  if (!objectIds.length) {
    throw new Error('NOT_FOUND')
  }

  qb.reset()
  qb.select('attributes.name, attributes.id, oa.value, oa.objectId AS objectId')
  qb.from('objects_attributes oa')
  qb.join('attributes', 'attributes.id = oa.attributeId', 'inner')
  qb.whereIn('oa.objectId', objectIds)

  const objectAttributesSql = qb.get()
  const objectAttributes = await db.executeQuery<ObjectAttributeJoinRow>(
    objectAttributesSql
  )

  qb.reset()
  qb.select(
    'classes.name, classes.id, oc.classId AS classId, oc.objectId AS objectId'
  )
  qb.from('objects_classes oc')
  qb.join('classes', 'classes.id = oc.classId', 'inner')
  qb.whereIn('oc.objectId', objectIds)

  const objectClassesSql = qb.get()
  const objectClasses = await db.executeQuery<ObjectClassJoinRow>(
    objectClassesSql
  )

  return objects.map((object) => {
    const attributes = objectAttributes
      .filter((attribute) => attribute.objectId === object.id)
      .map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        value: attribute.value,
      }))

    const classes: NamedEntity[] = objectClasses
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
}

export const findOne = async ({ id }: ObjectFindOneOptions = {}): Promise<
  ObjectWithRelations | undefined
> => {
  const [result] = await find({ ids: id !== undefined ? [id] : undefined })
  return result
}
