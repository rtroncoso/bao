import type { AccountRow } from '@bao/types'

import db from '../db'
import { QueryBuilder } from '../queryBuilder'

interface AccountFindOptions {
  ids?: Array<number | string>
  username?: string
}

interface AccountFindOneOptions {
  id?: number | string
  username?: string
}

export const find = async ({ ids, username }: AccountFindOptions = {}): Promise<
  AccountRow[]
> => {
  const qb = new QueryBuilder()
  qb.select('*')
  qb.from('accounts')

  if (ids !== undefined) {
    qb.whereIn('id', ids)
  }

  if (username) {
    qb.where('username', username)
  }

  const sql = qb.get()
  const accounts = await db.executeQuery<AccountRow>(sql)

  if (!accounts.length) {
    throw new Error('NOT_FOUND')
  }

  return accounts
}

export const findOne = async ({
  id,
  username,
}: AccountFindOneOptions = {}): Promise<AccountRow | undefined> => {
  const ids = id !== undefined ? [id] : undefined

  const [result] = await find({ ids, username })

  return result
}
