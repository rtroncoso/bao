import express from 'express'
import {
  adminUpdatePosition,
  find,
  findOne,
  inventory,
  updatePosition,
} from './middleware'

import { getAccountFromToken } from '../accounts/middleware'
import { adminAuth } from '../middleware/adminAuth'

const adminRouter = express.Router()
adminRouter.get('/', find)
adminRouter.get('/:id', findOne)
adminRouter.get('/:id/inventory', inventory)
adminRouter.patch('/:id/position', adminAuth, adminUpdatePosition)

const clientRouter = express.Router()
clientRouter.use(getAccountFromToken)
clientRouter.patch('/:id/position', updatePosition)

export default {
  admin: adminRouter,
  client: clientRouter,
}
