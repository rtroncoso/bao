import db from '../db'
import { QueryBuilder } from '../queryBuilder'
import * as ObjectModel from '../objects/model'

export const find = async ({ ids, accountId } = {}) => {
  const qb = new QueryBuilder()
  qb.select('*')
  qb.from('characters')

  if (ids) {
    qb.whereIn('id', ids)
  }

  if (accountId) {
    qb.where('account_id', accountId)
  }

  const charactersSql = await qb.get()
  const characters = await db.executeQuery(charactersSql)
  const charactersIds = characters.map((character) => character.id)

  if (!charactersIds.length) {
    throw new Error('NOT_FOUND')
  }

  // Classes

  qb.reset()
  qb.select('classes.name, classes.id, characters.id AS characterId')
  qb.from('classes')
  qb.join('characters', 'classes.id = characters.class_id', 'inner')
  qb.whereIn('characters.id', charactersIds)

  const characterClassesSql = await qb.get()
  const characterClasses = await db.executeQuery(characterClassesSql)

  // Races

  qb.reset()
  qb.select('races.name, races.id, characters.id AS characterId')
  qb.from('races')
  qb.join('characters', 'races.id = characters.race_id', 'inner')
  qb.whereIn('characters.id', charactersIds)

  const characterRacesSql = await qb.get()
  const characterRaces = await db.executeQuery(characterRacesSql)

  // Response
  const response = characters.map((character) => {
    // Classes
    const $class = characterClasses
      .filter(($class) => $class.characterId === character.id)
      .map(($class) => ({
        id: $class.id,
        name: $class.name,
      }))

    // Races
    const race = characterRaces
      .filter((race) => race.characterId === character.id)
      .map((race) => ({
        id: race.id,
        name: race.name,
      }))

    delete character.class_id
    delete character.race_id

    return {
      ...character,
      class: $class,
      race,
    }
  })

  return response
}

export const findOne = async ({ id } = {}) => {
  const [result] = await find({ ids: [id] })
  return result
}

export const inventory = async ({ characterId } = {}) => {
  const qb = new QueryBuilder()
  qb.select('object_id, amount')
  qb.from('character_inventory')
  qb.whereIn('character_id', characterId)

  const inventorySql = await qb.get()
  const inventory = await db.executeQuery(inventorySql)

  //Objects
  const objectsIds = inventory.map((obj) => obj.object_id)
  const objects = await ObjectModel.find({ ids: objectsIds })

  const response = inventory.map((slot) => {
    const slotObject = objects.filter((object) => object.id === slot.object_id)
    slot.object = slotObject[0]
    delete slot.object_id
    return slot
  })

  return response
}
