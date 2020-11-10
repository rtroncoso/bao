export class QueryBuilder {
  constructor() {
    this.reset()
    this.qbConnection

    //Debugging
    this.queries = []
  }

  reset() {
    this.qbSelect = []
    this.qbFrom
    this.qbWhere = []
    this.qbOrderBy = []
    this.qbGroupBy = []
    this.qbLimit = 0
    this.qbOffset = 0
    this.qbJoin = []
  }

  select(select) {
    select = select.split(',')

    for (let i = 0; i < select.length; i++) {
      const val = select[i].trim()
      this.qbSelect.push(val)
    }
  }

  from(from) {
    this.qbFrom = from
  }

  hasOperator(str) {
    return str.match(
      /(<|>|!|=|\sIS NULL|\sIS NOT NULL|\sEXISTS|\sBETWEEN|\sLIKE|\sIN\s*\(|\s)/i
    )
  }

  where(key, value) {
    let where = ''

    if (this.hasOperator(key)) {
      where = key
    } else {
      where = key + " = '" + value + "'"
    }

    this.qbWhere.push(where)
  }

  whereIn(key, value, not = false) {
    not = not ? ' NOT' : ''

    const values = []
    for (let i = 0; i < value.length; i++) {
      const val = '"' + value[i] + '"'
      values.push(val)
    }

    const where = key + not + ' IN(' + values.join() + ')'
    this.qbWhere.push(where)
  }

  orderBy(value, type = 'ASC') {
    const orderBy = value + ' ' + type

    this.qbOrderBy.push(orderBy)
  }

  groupBy(value) {
    this.qbOrderBy.push(value)
  }

  limit(value, offset = 0) {
    this.qbLimit = parseInt(value)

    if (offset) {
      this.qbOffset = parseInt(offset)
    }
  }

  join(table, cond, type = '') {
    if (type !== '') {
      type = type.trim()
      type = type.toUpperCase(type)

      const types = [
        'LEFT',
        'RIGHT',
        'OUTER',
        'INNER',
        'LEFT OUTER',
        'RIGHT OUTER'
      ]
      if (types.indexOf(type) == -1) {
        type = ''
      } else {
        type += ' '
      }

      // Assemble the JOIN statement
      const join = type + 'JOIN ' + table + ' ON ' + cond
      this.qbJoin.push(join)
    }
  }

  lastQuery() {
    const arr = this.queries
    return arr[arr.length - 1]
  }

  countAllResults(env) {
    return new Promise(async (resolve, reject) => {
      this.qbSelect = ['COUNT(*) as count']
      const response = await this.get(env)
      resolve(response[0].count)
    })
  }

  get(env) {
    return new Promise(async (resolve, reject) => {
      let $sql = 'SELECT '

      /* --- Select --- */

      if (!this.qbSelect.length) {
        $sql += '*'
      } else {
        $sql += this.qbSelect.join(', ')
      }

      /* --- From --- */

      $sql += '\nFROM ' + this.qbFrom

      /* --- Join --- */

      // Write the "JOIN" portion of the query
      if (this.qbJoin.length) {
        $sql += '\n' + this.qbJoin.join('\n')
      }

      /* --- Where --- */

      if (this.qbWhere.length) {
        let where = this.qbWhere.join(' AND ')
        where = where.replace(/AND\s*$/, '')
        $sql += '\nWHERE ' + where
      }

      /* -- Order by -- */
      if (this.qbOrderBy.length) {
        let orderBy = this.qbOrderBy.join(',')
        $sql += '\nORDER BY ' + orderBy
      }

      /* -- Group by -- */
      if (this.qbGroupBy.length) {
        let groupBy = this.qbGroupBy.join(',')
        $sql += '\nGROUP BY ' + groupBy
      }

      /* --- Limit --- */

      if (this.qbLimit > 0) {
        $sql +=
          '\nLIMIT ' +
          (this.qbOffset ? this.qbOffset + ', ' : '') +
          this.qbLimit
      }

      if (process.env.NODE_ENV === 'development') console.log($sql)
      resolve($sql)
    })
  }
}

