/** Row shape for `characters` — see packages/api/sql/2020-11-09_characters.sql */
export interface CharacterRow {
  id: number
  accountId: number
  name: string
  classId: number
  raceId: number
  body: number
  head: number
  helmet: number | null
  shield: number | null
  weapon: number | null
  genre: number
  world: number
  mapId: number
  x: number
  y: number
  worldX: number
  worldY: number
}

export interface CharacterPositionUpdate {
  mapId: number
  x: number
  y: number
  worldX: number
  worldY: number
}
