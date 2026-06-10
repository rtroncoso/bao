import express from 'express'

import { getAccountFromToken } from '../accounts/middleware'
import { find, findOne, findSpawns } from './middleware'

const adminRouter = express.Router()
adminRouter.get('/', find)
adminRouter.get('/:id', findOne)
adminRouter.get('/:id/spawns', findSpawns)

const clientRouter = express.Router()
clientRouter.use(getAccountFromToken)
clientRouter.get('/:id/spawns', findSpawns)

export default {
  admin: adminRouter,
  client: clientRouter,
}
