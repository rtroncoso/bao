import bodyParser from 'body-parser'
import cors from 'cors'
import config from './config'

import errors from './errors'
import { route as objects } from './objects'
import { route as accounts } from './accounts'
import { route as characters } from './characters'

let instance = null

export default () => instance

module.exports = (app) => {
  instance = app
  app.set('port', config.app.port)
  app.use(cors())
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(bodyParser.raw({ limit: '50mb' }))
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
    })
  )

  app.use('/healthcheck', (req, res, next) => {
    res.sendStatus(200)
  })

  // ADMIN ENDPOINTS
  app.use('/admin/accounts', accounts.admin)
  app.use('/admin/objects', objects.admin)
  app.use('/admin/characters', characters.admin)

  // CLIENT ENDPOINTS
  app.use('/client/objects', objects.client)
  app.use('/client/accounts', accounts.client)
  app.use('/client/characters', characters.client)

  app.use((err, req, res, next) => {
    const error =
      errors[err.message] ||
      Object.assign(errors.UNEXPECTED_ERROR, {
        variables: { details: err.message },
      })

    res.status(error.code)
    res.send(
      process.env.NODE_ENV === 'production'
        ? {
            message: error.message,
            payload: err.payload || error.payload,
            variables: err.variables || error.variables,
          }
        : {
            message: error.message,
            payload: err.payload || error.payload,
            variables: err.variables || error.variables,
            stack: err.stack,
          }
    )
  })
}
