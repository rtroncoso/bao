import type { AccountPublic } from '../db/accounts'
import type { CharacterRow } from '../db/characters'
import type { ObjectRow } from '../db/objects'

export interface NamedEntity {
  id: number
  name: string
}

export interface CharacterClassJoinRow extends NamedEntity {
  characterId: number
}

export interface CharacterRaceJoinRow extends NamedEntity {
  characterId: number
}

export interface ObjectAttributeJoinRow extends NamedEntity {
  objectId: number
  value: string
}

export interface ObjectClassJoinRow {
  id: number
  name: string
  classId: number
  objectId: number
}

export interface CharacterWithRelations
  extends Omit<CharacterRow, 'classId' | 'raceId'> {
  class: NamedEntity[]
  race: NamedEntity[]
}

export interface ObjectAttribute extends NamedEntity {
  value: string
}

export interface ObjectWithRelations extends ObjectRow {
  attributes: ObjectAttribute[]
  classes: NamedEntity[]
}

export interface InventorySlotResponse {
  amount: number
  object: ObjectWithRelations
}

export interface AuthenticatedAccountResponse extends AccountPublic {
  password?: string
  characters?: CharacterWithRelations[]
}

export interface LoginResponse {
  account: AuthenticatedAccountResponse
  token: string
}

export interface CountResultRow {
  count: number
}
