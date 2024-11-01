import { Request } from 'express'
import { tryCatch } from '../middlewares/error.js'
import { NewOrderRequestBody } from '../types/types.js'
import ErrorHandler from '../utils/utility-class.js'
import { Order } from '../models/Order.js'
import { getFromCache, invalidateCache, reduceStock, setCache } from '../utils/features.js'
import { isValidObjectId } from 'mongoose'
import { messaging } from '../config/firebase.js'
import { Message, MulticastMessage } from 'firebase-admin/messaging'
import { FCMToken } from '../models/FCMToken.js'

export const newOrder = tryCatch(async (req: Request<{}, {}, NewOrderRequestBody>, res) => {
   const { discount, orderItems, shippingCharges, shippingInfo, subtotal, tax, total, user } = req.body

   if (!orderItems.length || !subtotal || !tax || !total || !user) {
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

   const fcmTokens = await FCMToken.find()
   const fcmTokenArr = fcmTokens.map((fcm) => fcm.token)

   const payload: MulticastMessage = {
      tokens: fcmTokenArr,
      notification: {
         title: `New Order Received of ${orderItems.length} item(s)`,
         body: `Total Price: ${total}`,
      },
      webpush: {
         fcmOptions: {
            link: `/admin/transactions/${newOrder._id}`,
         },
      },
   }

   await messaging.sendEachForMulticast(payload)

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
         orders: cachedMyOrders,
         totalOrders: cachedMyOrders.length,
      })
   }

   const myOrders = await Order.find({ user: id }).sort({ createdAt: 'desc' })
   if (!myOrders.length) throw new ErrorHandler('No Orders found!', 404)
   setCache(`myOrders-${id}`, myOrders)

   res.status(200).json({
      success: true,
      orders: myOrders,
      totalOrders: myOrders.length,
   })
})

export const allOrders = tryCatch(async (req, res) => {
   const cachedAllOrders = getFromCache<object[]>(`all-orders`)

   if (cachedAllOrders) {
      return res.status(200).json({
         success: true,
         orders: cachedAllOrders,
         totalOrders: cachedAllOrders.length,
      })
   }

   const allOrders = await Order.find().populate('user', 'name')
   if (!allOrders.length) throw new ErrorHandler('No Orders Found', 404)
   setCache(`all-orders`, allOrders)

   res.status(200).json({
      success: true,
      orders: allOrders,
      totalOrders: allOrders.length,
   })
})

export const getSingleOrder = tryCatch(async (req, res) => {
   const { orderId } = req.params

   if (!isValidObjectId(orderId)) throw new ErrorHandler('Invalid Order ID', 400)

   const cachedOrder = getFromCache<object>(`order-${orderId}`)

   if (cachedOrder) {
      return res.status(200).json({
         success: true,
         order: cachedOrder,
      })
   }

   const order = await Order.findById(orderId).populate('user', 'name')
   if (!order) throw new ErrorHandler('Cannot find order details', 404)
   setCache(`order-${orderId}`, order)

   res.status(200).json({
      success: true,
      order,
   })
})

export const processOrder = tryCatch(async (req, res) => {
   const { orderId } = req.params
   const status = req.query.status as 'Processing' | 'Shipped' | 'Delivered'

   if (orderId && !isValidObjectId(orderId)) throw new ErrorHandler('Invalid Order ID', 400)

   if (!status) throw new ErrorHandler('Please provide order status', 400)

   const order = await Order.findById(orderId)
   if (!order) throw new ErrorHandler('Cannot find order details', 404)

   order.status = status

   await order.save()

   invalidateCache({ order: true, admin: true, orderId, userId: order.user.toString() })

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

   invalidateCache({ order: true, admin: true, orderId, userId: order.user })

   res.status(200).json({
      success: true,
      message: 'Order deleted successfully!',
   })
})
