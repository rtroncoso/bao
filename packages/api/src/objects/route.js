import express from 'express'
import {
  //active,
  //create,
  find,
  findOne,
  //remove,
  //restore,
  //update
} from './middleware'

//import { getUserFromToken, isAdmin } from '../auth/middleware'

const adminRouter = express.Router()
//adminRouter.use(getUserFromToken)
//adminRouter.use(isAdmin)
adminRouter.get('/', find)
//adminRouter.post('/', create)
adminRouter.get('/:id', findOne)
//adminRouter.patch('/:objectId', update)
//adminRouter.delete('/:objectId', remove)

const clientRouter = express.Router()
//clientRouter.use(getUserFromToken)
//clientRouter.use(isAdmin)
clientRouter.get('/', find)
//clientRouter.post('/', create)
clientRouter.get('/:id', findOne)
//clientRouter.patch('/:objectId', update)
//clientRouter.delete('/:objectId', remove)

export default {
  admin: adminRouter,
  client: clientRouter
}
