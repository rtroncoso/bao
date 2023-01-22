import express from 'express'
import { find, findOne, login } from './middleware'

const adminRouter = express.Router()
adminRouter.get('/', find)
adminRouter.get('/:id', findOne)

const clientRouter = express.Router()
clientRouter.post('/login', login)

export default {
  admin: adminRouter,
  client: clientRouter,
}
