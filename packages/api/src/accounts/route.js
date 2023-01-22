import express from 'express'
import { find, findOne, login } from './middleware'

//import { getUserFromToken, isAdmin } from '../auth/middleware'

const adminRouter = express.Router()
adminRouter.get('/', find)
adminRouter.get('/:id', findOne)

const clientRouter = express.Router()
clientRouter.get('/', find)
clientRouter.get('/:id', findOne)
clientRouter.post('/login', login)

export default {
  admin: adminRouter,
  client: clientRouter,
}
