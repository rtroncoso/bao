import { buildExpressCorsOptions } from '@bao/env'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import type { ApiError, ApiErrorRequestHandler } from '@bao/types'
import { isApiErrorCode } from '@bao/types'

import config from './config'
import errors from './errors'
import { route as objects } from './objects'
import { route as accounts } from './accounts'
import { route as characters } from './characters'
import { route as maps } from './maps'
import { adminAuth } from './middleware/adminAuth'

let instance: express.Application | null = null

export const getInstance = () => instance

export default function initExpress(app: express.Application): void {
  instance = app
  app.set('port', config.app.port)
  app.use(cors(buildExpressCorsOptions(config.corsOrigins)))
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(bodyParser.raw({ limit: '50mb' }))
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
    })
  )

  app.use('/healthcheck', (_req, res) => {
    res.sendStatus(200)
  })

  app.use('/admin/accounts', accounts.admin)
  app.use('/admin/objects', objects.admin)
  app.use('/admin/characters', characters.admin)
  app.use('/admin/maps', adminAuth, maps.admin)

  app.use('/client/objects', objects.client)
  app.use('/client/accounts', accounts.client)
  app.use('/client/characters', characters.client)
  app.use('/client/maps', maps.client)

  const errorHandler: ApiErrorRequestHandler = (err, _req, res, _next) => {
    const apiError = err as ApiError
    const error = isApiErrorCode(apiError.message)
      ? errors[apiError.message]
      : Object.assign(errors.UNEXPECTED_ERROR, {
          variables: { details: apiError.message },
        })

    res.status(error.code)
    res.send(
      process.env.NODE_ENV === 'production'
        ? {
            message: error.message,
            payload: apiError.payload || error.payload,
            variables: apiError.variables || error.variables,
          }
        : {
            message: error.message,
            payload: apiError.payload || error.payload,
            variables: apiError.variables || error.variables,
            stack: apiError.stack,
          }
    )
  }

  app.use(errorHandler)
}
