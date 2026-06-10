import type {
  MapNpcSpawnRow,
  MapObjectSpawnRow,
  MapRow,
  MapSpawnsResponse,
  MapTileExitRow,
} from '@bao/types'

import db from '../db'
import { QueryBuilder } from '../queryBuilder'

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
    'mns.id, mns.mapId, mns.npcId, mns.x, mns.y, n.body AS bodyId, n.head AS headId, n.heading'
  )
  qb.from('map_npc_spawns AS mns')
  qb.join('npcs AS n', 'n.id = mns.npcId', 'inner')
  qb.where('mns.mapId', mapId)
  const npcs = await db.executeQuery<MapNpcSpawnRow>(qb.get())

  qb.reset()
  qb.select(
    'mos.id, mos.mapId, mos.objectId, mos.amount, mos.x, mos.y, o.graphicId'
  )
  qb.from('map_object_spawns AS mos')
  qb.join('objects AS o', 'o.id = mos.objectId', 'inner')
  qb.where('mos.mapId', mapId)
  const objects = await db.executeQuery<MapObjectSpawnRow>(qb.get())

  qb.reset()
  qb.select('*')
  qb.from('map_tile_exits')
  qb.where('mapId', mapId)
  const tileExits = await db.executeQuery<MapTileExitRow>(qb.get())

  return { map, npcs, objects, tileExits }
}
