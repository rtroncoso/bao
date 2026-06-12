import type {
  MapBlockedTileRow,
  MapNpcSpawnRow,
  MapObjectSpawnRow,
  MapRow,
  MapSpawnsResponse,
  MapTileExitRow,
} from '@bao/types'

import db from '../db'
import { QueryBuilder } from '../queryBuilder'

const DOOR_OBJECT_TYPE = 6

interface ObjectAttributeValueRow {
  objectId: number
  name: string
  value: string
}

interface ObjectGraphicRow {
  id: number
  graphicId: number
}

const enrichDoorSpawnVariants = async (
  objects: MapObjectSpawnRow[]
): Promise<MapObjectSpawnRow[]> => {
  const doorSpawns = objects.filter(
    (spawn) => spawn.objectType === DOOR_OBJECT_TYPE
  )

  if (!doorSpawns.length) {
    return objects
  }

  const doorObjectIds = [...new Set(doorSpawns.map((spawn) => spawn.objectId))]
  const qb = new QueryBuilder()
  qb.select('oa.objectId, attributes.name, oa.value')
  qb.from('objects_attributes AS oa')
  qb.join('attributes', 'attributes.id = oa.attributeId', 'inner')
  qb.whereIn('oa.objectId', doorObjectIds)
  qb.whereIn('attributes.name', ['indexabierta', 'indexcerrada'])

  const attributeRows = await db.executeQuery<ObjectAttributeValueRow>(qb.get())
  const attributesByObjectId = new Map<number, Record<string, number>>()

  for (const row of attributeRows) {
    const parsed = Number.parseInt(row.value, 10)
    if (Number.isNaN(parsed)) {
      continue
    }

    const current = attributesByObjectId.get(row.objectId) ?? {}
    current[row.name] = parsed
    attributesByObjectId.set(row.objectId, current)
  }

  const variantObjectIds = new Set<number>()
  for (const spawn of doorSpawns) {
    const attributes = attributesByObjectId.get(spawn.objectId) ?? {}
    variantObjectIds.add(attributes.indexabierta ?? spawn.objectId)
    variantObjectIds.add(attributes.indexcerrada ?? spawn.objectId)
  }

  qb.reset()
  qb.select('id, graphicId')
  qb.from('objects')
  qb.whereIn('id', [...variantObjectIds])
  const variantRows = await db.executeQuery<ObjectGraphicRow>(qb.get())
  const graphicByObjectId = new Map(
    variantRows.map((row) => [row.id, row.graphicId])
  )

  return objects.map((spawn) => {
    if (spawn.objectType !== DOOR_OBJECT_TYPE) {
      return spawn
    }

    const attributes = attributesByObjectId.get(spawn.objectId) ?? {}
    const openObjectId = attributes.indexabierta ?? spawn.objectId
    const closedObjectId = attributes.indexcerrada ?? spawn.objectId
    const openGraphicId = graphicByObjectId.get(openObjectId)
    const closedGraphicId = graphicByObjectId.get(closedObjectId)

    if (!openGraphicId || !closedGraphicId) {
      return spawn
    }

    return {
      ...spawn,
      openObjectId,
      closedObjectId,
      openGraphicId,
      closedGraphicId,
    }
  })
}

interface MapFindOptions {
  ids?: Array<number | string>
}

interface MapFindOneOptions {
  id?: number | string
}

export const find = async ({ ids }: MapFindOptions = {}): Promise<MapRow[]> => {
  const qb = new QueryBuilder()
  qb.select('*')
  qb.from('maps')

  if (ids) {
    qb.whereIn('id', ids)
  }

  return db.executeQuery<MapRow>(qb.get())
}

export const findOne = async ({ id }: MapFindOneOptions = {}): Promise<
  MapRow | undefined
> => {
  const [result] = await find({ ids: id !== undefined ? [id] : undefined })
  return result
}

export const findSpawns = async (
  mapId: number | string
): Promise<MapSpawnsResponse> => {
  const map = await findOne({ id: mapId })
  if (!map) {
    throw new Error('NOT_FOUND')
  }

  const qb = new QueryBuilder()
  qb.select(
    'mns.id, mns.mapId, mns.npcId, mns.x, mns.y, n.body AS bodyId, n.head AS headId, n.heading, n.description, n.hostile'
  )
  qb.from('map_npc_spawns AS mns')
  qb.join('npcs AS n', 'n.id = mns.npcId', 'inner')
  qb.where('mns.mapId', mapId)
  const npcs = await db.executeQuery<MapNpcSpawnRow>(qb.get())

  qb.reset()
  qb.select(
    'mos.id, mos.mapId, mos.objectId, mos.amount, mos.x, mos.y, o.graphicId, o.object_typeId AS objectType'
  )
  qb.from('map_object_spawns AS mos')
  qb.join('objects AS o', 'o.id = mos.objectId', 'inner')
  qb.where('mos.mapId', mapId)
  let objects = await db.executeQuery<MapObjectSpawnRow>(qb.get())
  objects = await enrichDoorSpawnVariants(objects)

  qb.reset()
  qb.select('*')
  qb.from('map_tile_exits')
  qb.where('mapId', mapId)
  const tileExits = await db.executeQuery<MapTileExitRow>(qb.get())

  qb.reset()
  qb.select('*')
  qb.from('map_blocked_tiles')
  qb.where('mapId', mapId)
  const blockedTiles = await db.executeQuery<MapBlockedTileRow>(qb.get())

  return { map, npcs, objects, tileExits, blockedTiles }
}
