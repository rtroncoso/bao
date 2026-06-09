import http from 'http'
import express from 'express'
import config from './config'
import db from './db'
import initExpress from './express'

db.connect()
  .then(() => {
    console.log('Connected to mysql...')
    const app = express()
    const server = http.createServer(app)
    initExpress(app)

    server.listen(config.app.port)
    console.log('Running on port', config.app.port)
    console.log('¿¿Estás loco?? ¿¿Cómo vas a piñatear un gm?? :@')
  })
  .catch((e) => {
    console.error('Error connecting mysql...', e)
    process.exit()
  })
