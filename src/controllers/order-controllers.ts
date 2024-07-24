import { Request } from 'express'
import { tryCatch } from '../middlewares/error.js'
import { NewOrderRequestBody } from '../types/types.js'
import ErrorHandler from '../utils/utility-class.js'
import { Order } from '../models/Order.js'
import { getFromCache, invalidateCache, reduceStock, setCache } from '../utils/features.js'
import { isValidObjectId } from 'mongoose'

export const newOrder = tryCatch(async (req: Request<{}, {}, NewOrderRequestBody>, res) => {
   const { discount, orderItems, shippingCharges, shippingInfo, subtotal, tax, total, user } = req.body

   if (!discount || !orderItems || !orderItems || !shippingInfo || !subtotal || !tax || !total || !user) {
      throw new ErrorHandler('Please provide all the fields', 400)
   }

   const { address, city, country, pinCode, state } = shippingInfo

   if (!address || !city || !country || !pinCode || !state) {
      throw new ErrorHandler('Incomplete shipping Info', 400)
   }

   if (!orderItems.length) throw new ErrorHandler('No Items in the order', 400)

   const newOrder = await Order.create({
      discount,
      orderItems,
      shippingCharges,
      shippingInfo,
      subtotal,
      tax,
      total,
      user,
   })

   if (!newOrder) throw new ErrorHandler('Order cannot be created. Check Database!', 400)

   await reduceStock(orderItems)

   invalidateCache({
      product: true,
      order: true,
      admin: true,
      productId: orderItems.map((item) => item.productId.toString()),
      userId: user,
   })

   res.status(201).json({
      success: true,
      message: 'Order created successfully',
   })
})

export const myOrders = tryCatch(async (req, res) => {
   const { id } = req.query

   if (!id) throw new ErrorHandler('You should login first!', 401)

   const cachedMyOrders = getFromCache<object[]>(`myOrders-${id}`)

   if (cachedMyOrders) {
      return res.status(200).json({
         success: true,
         myOrders: cachedMyOrders,
         totalOrders: cachedMyOrders.length,
      })
   }

   const myOrders = await Order.find({ user: id })
   if (!myOrders.length) throw new ErrorHandler('No Orders found!', 404)
   setCache(`myOrders-${id}`, myOrders)

   res.status(200).json({
      success: true,
      myOrders: myOrders,
      totalOrders: myOrders.length,
   })
})

export const allOrders = tryCatch(async (req, res) => {
   const cachedAllOrders = getFromCache<object[]>(`all-orders`)

   if (cachedAllOrders) {
      return res.status(200).json({
         success: true,
         allOrders: cachedAllOrders,
         totalOrders: cachedAllOrders.length,
      })
   }

   const allOrders = await Order.find()
   if (!allOrders.length) throw new ErrorHandler('No Orders Found', 404)
   setCache(`all-orders`, allOrders)

   res.status(200).json({
      success: true,
      allOrders,
      totalOrders: allOrders.length,
   })
})

export const getSingleOrder = tryCatch(async (req, res) => {
   const { orderId } = req.params

   if (!isValidObjectId(orderId)) throw new ErrorHandler('Invalid Order ID', 400)

   const cachedOrder = getFromCache<object[]>(`order-${orderId}`)

   if (cachedOrder) {
      return res.status(200).json({
         success: true,
         order: cachedOrder,
      })
   }

   const order = await Order.findById(orderId).populate("user", "name")
   if (!order) throw new ErrorHandler('Cannot find order details', 404)
   setCache(`order-${orderId}`, order)

   res.status(200).json({
      success: true,
      order,
   })
})

export const processOrder = tryCatch(async (req, res) => {
   const { orderId } = req.params

   if (orderId && !isValidObjectId(orderId)) throw new ErrorHandler('Invalid Order ID', 400)

   const order = await Order.findById(orderId)
   if (!order) throw new ErrorHandler('Cannot find order details', 404)

   switch (order.status) {
      case 'Processing':
         order.status = 'Delivered'
         break
      case 'Delivered':
         order.status = 'Shipped'
         break
      default:
         break
   }

   await order.save()

   invalidateCache({ order: true, orderId, userId: order.user.toString() })

   res.status(200).json({
      success: true,
      message: 'Order processed!',
   })
})

export const deleteOrder = tryCatch(async (req, res) => {
   const { orderId } = req.params

   if (orderId && !isValidObjectId(orderId)) throw new ErrorHandler('Invalid Order ID', 400)

   const order = await Order.findById(orderId)
   if (!order) throw new ErrorHandler('Cannot find order details', 404)

   await order.deleteOne()

   invalidateCache({ order: true, orderId, userId: order.user })

   res.status(200).json({
      success: true,
      message: 'Order deleted successfully!',
   })
})
