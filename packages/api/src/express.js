import bodyParser from 'body-parser'
import pino from 'express-pino-logger'
import logger from './logging'
import config from './config'

import errors from './errors'
import { route as objects } from './objects'
import { route as accounts } from './accounts'
//import { route as auth } from './auth'

let instance = null

export default () => instance

module.exports = app => {
  instance = app
  app.set('port', config.app.port)

  //app.use(pino({ logger }))

  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(bodyParser.raw({ limit: '50mb' }))
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true
    })
  )

  /*app.use('/healthcheck', (req, res, next) => {
    res.sendStatus(200)
  })*/


  //ENDPOINTS
  app.use('/admin/objects', objects.admin)
  app.use('/client/objects', objects.client)

  app.use('/admin/accounts', accounts.admin)
  app.use('/client/accounts', accounts.client)
  //app.use('/admin/auth', auth.admin)

  app.use((err, req, res, next) => {
    const error =
      errors[err.message] ||
      Object.assign(errors.UNEXPECTED_ERROR, {
        variables: { details: err.message }
      })

    res.status(error.code)
    res.send(
      process.env.NODE_ENV === 'production'
        ? {
            message: error.message,
            payload: err.payload || error.payload,
            variables: err.variables || error.variables
          }
        : {
            message: error.message,
            payload: err.payload || error.payload,
            variables: err.variables || error.variables,
            stack: err.stack
          }
    )
  })
}
