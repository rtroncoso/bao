import express from 'express'
import { find, findOne } from './middleware'

import { getAccountFromToken } from '../accounts/middleware'

const adminRouter = express.Router()
adminRouter.get('/', find)
adminRouter.get('/:id', findOne)

const clientRouter = express.Router()
clientRouter.use(getAccountFromToken)

export default {
  admin: adminRouter,
  client: clientRouter,
}
