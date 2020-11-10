import config from './config'

const mysql = require('mysql')
const pool = mysql.createPool(config.db)

async function connect(cb) {
  return new Promise((resolve, reject) => {
    pool.on('connection', function(connection) {
      connection.on('error', function(err) {
        //logger.error('MySQL error event', err)
      })
      connection.on('close', function(err) {
        //logger.warn('MySQL close event', err)
      })
    })
    resolve()
  })
}

async function executeQuery(query) {
  //logger.debug(`query: `, query)
  return new Promise((resolve, reject) => {
    try {
      pool.query(query, (e, r, f) => {
        if (e) {
          return reject(e)
        }

        //logger.debug(r,f)
        resolve(r)
      })
    } catch (ex) {
      reject(ex)
    }
  })
}

async function execSP(spName, params) {
  return new Promise((resolve, reject) => {
    try {
      const paramPlaceHolder = ''
      if (params && params.length) {
        for (const i = 0; i < params.length; i++) {
          paramPlaceHolder += '?,'
        }
      }
      if (paramPlaceHolder.length) {
        paramPlaceHolder = paramPlaceHolder.slice(0, -1)
      }
      logger.debug('final SP call', `CALL ${spName}(${params})`)
      pool.query(`CALL ${spName}(${paramPlaceHolder})`, params, (e, r, f) => {
        if (e) {
          return reject(e)
        }

        resolve(r[0])
      })
    } catch (ex) {
      reject(ex)
    }
  })
}

export default {
  connect,
  executeQuery,
  execSP
}
