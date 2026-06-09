import type {
  CharacterClassJoinRow,
  CharacterInventoryRow,
  CharacterRaceJoinRow,
  CharacterRow,
  CharacterWithRelations,
  InventorySlotResponse,
} from '@bao/types'

import db from '../db'
import * as ObjectModel from '../objects/model'
import { QueryBuilder } from '../queryBuilder'

interface CharacterFindOptions {
  ids?: Array<number | string>
  accountId?: number | string
}

interface CharacterFindOneOptions {
  id?: number | string
}

export const find = async ({
  ids,
  accountId,
}: CharacterFindOptions = {}): Promise<CharacterWithRelations[]> => {
  const qb = new QueryBuilder()
  qb.select('*')
  qb.from('characters')

  if (ids) {
    qb.whereIn('id', ids)
  }

  if (accountId) {
    qb.where('accountId', accountId)
  }

  const charactersSql = qb.get()
  const characters = await db.executeQuery<CharacterRow>(charactersSql)
  const charactersIds = characters.map((character) => character.id)

  if (!charactersIds.length) {
    throw new Error('NOT_FOUND')
  }

  qb.reset()
  qb.select('classes.name, classes.id, characters.id AS characterId')
  qb.from('classes')
  qb.join('characters', 'classes.id = characters.classId', 'inner')
  qb.whereIn('characters.id', charactersIds)

  const characterClassesSql = qb.get()
  const characterClasses = await db.executeQuery<CharacterClassJoinRow>(
    characterClassesSql
  )

  qb.reset()
  qb.select('races.name, races.id, characters.id AS characterId')
  qb.from('races')
  qb.join('characters', 'races.id = characters.raceId', 'inner')
  qb.whereIn('characters.id', charactersIds)

  const characterRacesSql = qb.get()
  const characterRaces = await db.executeQuery<CharacterRaceJoinRow>(
    characterRacesSql
  )

  return characters.map((character) => {
    const classNames = characterClasses
      .filter(($class) => $class.characterId === character.id)
      .map(($class) => ({
        id: $class.id,
        name: $class.name,
      }))

    const race = characterRaces
      .filter((raceRow) => raceRow.characterId === character.id)
      .map((raceRow) => ({
        id: raceRow.id,
        name: raceRow.name,
      }))

    const { classId: _classId, raceId: _raceId, ...rest } = character

    return {
      ...rest,
      class: classNames,
      race,
    }
  })
}

export const findOne = async ({ id }: CharacterFindOneOptions = {}): Promise<
  CharacterWithRelations | undefined
> => {
  const [result] = await find({ ids: id !== undefined ? [id] : undefined })
  return result
}

export const inventory = async ({
  characterId,
}: {
  characterId?: number | string
} = {}): Promise<InventorySlotResponse[]> => {
  const qb = new QueryBuilder()
  qb.select('objectId, amount')
  qb.from('character_inventory')

  if (characterId !== undefined) {
    qb.whereIn('characterId', characterId)
  }

  const inventorySql = qb.get()
  const inventoryRows = await db.executeQuery<
    Pick<CharacterInventoryRow, 'objectId' | 'amount'>
  >(inventorySql)

  const objectsIds = inventoryRows.map((obj) => obj.objectId)
  const objects = await ObjectModel.find({ ids: objectsIds })

  return inventoryRows.map((slot) => {
    const slotObject = objects.find((object) => object.id === slot.objectId)

    if (!slotObject) {
      throw new Error('NOT_FOUND')
    }

    return {
      amount: slot.amount,
      object: slotObject,
    }
  })
}
