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
  qb.select('*')
  qb.from('map_npc_spawns')
  qb.where('mapId', mapId)
  const npcs = await db.executeQuery<MapNpcSpawnRow>(qb.get())

  qb.reset()
  qb.select('*')
  qb.from('map_object_spawns')
  qb.where('mapId', mapId)
  const objects = await db.executeQuery<MapObjectSpawnRow>(qb.get())

  qb.reset()
  qb.select('*')
  qb.from('map_tile_exits')
  qb.where('mapId', mapId)
  const tileExits = await db.executeQuery<MapTileExitRow>(qb.get())

  return { map, npcs, objects, tileExits }
}
