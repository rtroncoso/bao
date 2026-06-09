/** Row shape for `accounts` — see packages/api/sql/2020-11-09_full.sql */
export interface AccountRow {
  id: number
  username: string
  email: string
  password: string
}

export type AccountPublic = Omit<AccountRow, 'password'>
