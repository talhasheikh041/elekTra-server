import express from 'express'
import {
   allOrders,
   deleteOrder,
   getSingleOrder,
   myOrders,
   newOrder,
   processOrder,
} from '../controllers/order-controllers.js'
import { adminOnly } from '../middlewares/auth.js'

const app = express.Router()

// Add new order  /api/v1/order/new
app.post('/new', newOrder)

// Get my orders  /api/v1/order/my
app.get('/my', myOrders)

// Get all orders  /api/v1/order/all
app.get('/all', adminOnly, allOrders)

// Get, Process, Delete single order  /api/v1/order/dynamicId
app.route('/:orderId').get(getSingleOrder).put(adminOnly, processOrder).delete(adminOnly, deleteOrder)

export default app
