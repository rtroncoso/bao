import type { QueryValue } from '@bao/types'

export class QueryBuilder {
  qbSelect: string[]
  qbFrom: string
  qbWhere: string[]
  qbOrderBy: string[]
  qbGroupBy: string[]
  qbLimit: number
  qbOffset: number
  qbJoin: string[]
  queries: string[]

  constructor() {
    this.reset()
    this.queries = []
  }

  reset(): void {
    this.qbSelect = []
    this.qbFrom = ''
    this.qbWhere = []
    this.qbOrderBy = []
    this.qbGroupBy = []
    this.qbLimit = 0
    this.qbOffset = 0
    this.qbJoin = []
  }

  select(selectStr: string): void {
    const parts = selectStr.split(',')

    for (let i = 0; i < parts.length; i++) {
      const val = parts[i].trim()
      this.qbSelect.push(val)
    }
  }

  from(from: string): void {
    this.qbFrom = from
  }

  hasOperator(str: string): RegExpMatchArray | null {
    return str.match(
      /(<|>|!|=|\sIS NULL|\sIS NOT NULL|\sEXISTS|\sBETWEEN|\sLIKE|\sIN\s*\(|\s)/i
    )
  }

  where(key: string, value?: string | number): void {
    let where = ''

    if (this.hasOperator(key)) {
      where = key
    } else {
      where = key + " = '" + value + "'"
    }

    this.qbWhere.push(where)
  }

  whereIn(key: string, value: QueryValue, not = false): void {
    const notStr = not ? ' NOT' : ''
    const values = Array.isArray(value) ? value : [value]

    const quoted = values.map((item) => '"' + item + '"')
    const where = key + notStr + ' IN(' + quoted.join() + ')'
    this.qbWhere.push(where)
  }

  orderBy(value: string, type = 'ASC'): void {
    const orderBy = value + ' ' + type
    this.qbOrderBy.push(orderBy)
  }

  groupBy(value: string): void {
    this.qbOrderBy.push(value)
  }

  limit(value: number | string, offset = 0): void {
    this.qbLimit = parseInt(String(value))

    if (offset) {
      this.qbOffset = parseInt(String(offset))
    }
  }

  join(table: string, cond: string, type = ''): void {
    if (type !== '') {
      type = type.trim()
      type = type.toUpperCase()

      const types = [
        'LEFT',
        'RIGHT',
        'OUTER',
        'INNER',
        'LEFT OUTER',
        'RIGHT OUTER',
      ]
      if (types.indexOf(type) === -1) {
        type = ''
      } else {
        type += ' '
      }

      const join = type + 'JOIN ' + table + ' ON ' + cond
      this.qbJoin.push(join)
    }
  }

  lastQuery(): string {
    const arr = this.queries
    return arr[arr.length - 1]
  }

  get(): string {
    let $sql = 'SELECT '

    if (!this.qbSelect.length) {
      $sql += '*'
    } else {
      $sql += this.qbSelect.join(', ')
    }

    $sql += '\nFROM ' + this.qbFrom

    if (this.qbJoin.length) {
      $sql += '\n' + this.qbJoin.join('\n')
    }

    if (this.qbWhere.length) {
      let where = this.qbWhere.join(' AND ')
      where = where.replace(/AND\s*$/, '')
      $sql += '\nWHERE ' + where
    }

    if (this.qbOrderBy.length) {
      const orderBy = this.qbOrderBy.join(',')
      $sql += '\nORDER BY ' + orderBy
    }

    if (this.qbGroupBy.length) {
      const groupBy = this.qbGroupBy.join(',')
      $sql += '\nGROUP BY ' + groupBy
    }

    if (this.qbLimit > 0) {
      $sql +=
        '\nLIMIT ' + (this.qbOffset ? this.qbOffset + ', ' : '') + this.qbLimit
    }

    if (process.env.NODE_ENV === 'development') console.log($sql)
    return $sql
  }
}
