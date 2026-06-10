import http from 'http'
import express from 'express'
import config from './config'
import db from './db'
import initExpress from './express'

console.log(
  `[@bao/api] starting (port ${config.app.port}, db ${config.db.host}/${config.db.database})`
)

db.connect()
  .then(() => {
    console.log('Connected to mysql...')
    const app = express()
    const server = http.createServer(app)
    initExpress(app)

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `Port ${config.app.port} is already in use. Stop the other @bao/api process or change API_PORT in .env.`
        )
      } else {
        console.error('HTTP server error', error)
      }
      process.exit(1)
    })

    server.listen(config.app.port)
    console.log('Running on port', config.app.port)
    console.log('¿¿Estás loco?? ¿¿Cómo vas a piñatear un gm?? :@')
  })
  .catch((e) => {
    console.error('Error connecting to MySQL — @bao/api will not start.', e)
    console.error(
      'Start a local database with: docker compose up -d mysql (from repo root)'
    )
    process.exit(1)
  })
