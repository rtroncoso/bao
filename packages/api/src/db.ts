import mysql from 'mysql2/promise'

import config from './config'

const pool = mysql.createPool(config.db)

async function connect(): Promise<void> {
  pool.on('connection', (connection) => {
    connection.on('error', (err: Error) => {
      console.error('MySQL error event', err)
    })
  })

  const maxAttempts = Number(process.env.MYSQL_CONNECT_RETRIES ?? 15)
  const delayMs = Number(process.env.MYSQL_CONNECT_DELAY_MS ?? 2000)

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await pool.query('SELECT 1')
      return
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts

      if (isLastAttempt) {
        throw error
      }

      console.warn(
        `MySQL not ready (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms...`
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

async function executeQuery<T>(query: string): Promise<T[]> {
  const [rows] = await pool.query(query)
  return rows as T[]
}

async function execSP<T>(
  spName: string,
  params?: Array<string | number | boolean | null>
): Promise<T[]> {
  let paramPlaceHolder = ''
  if (params && params.length) {
    for (let i = 0; i < params.length; i++) {
      paramPlaceHolder += '?,'
    }
  }
  if (paramPlaceHolder.length) {
    paramPlaceHolder = paramPlaceHolder.slice(0, -1)
  }

  const [rows] = await pool.query(`CALL ${spName}(${paramPlaceHolder})`, params)

  const resultSets = rows as unknown[][]
  return resultSets[0] as T[]
}

export default {
  connect,
  executeQuery,
  execSP,
}
