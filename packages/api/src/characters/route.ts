import express from 'express'
import { find, findOne, inventory } from './middleware'

import { getAccountFromToken } from '../accounts/middleware'

const adminRouter = express.Router()
adminRouter.get('/', find)
adminRouter.get('/:id', findOne)
adminRouter.get('/:id/inventory', inventory)

const clientRouter = express.Router()
clientRouter.use(getAccountFromToken)

export default {
  admin: adminRouter,
  client: clientRouter,
}
