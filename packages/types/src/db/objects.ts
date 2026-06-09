/** Row shape for `objects` — see packages/api/sql/2020-11-09_full.sql */
export interface ObjectRow {
  id: number
  name: string
  object_typeId: number
  graphicId: number
  description: string | null
}
