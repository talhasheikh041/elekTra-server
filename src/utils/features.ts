import mongoose from 'mongoose'
import { InvalidateCacheParam } from '../types/types.js'
import { Product } from '../models/Product.js'
import { myCache } from '../app.js'

export const connectDB = async () => {
   try {
      const { connection } = await mongoose.connect(process.env.DATABASE_URI!, { dbName: 'elektraDB' })
      console.log(`Connected to DB ${connection.host}`)
   } catch (error) {
      console.log(error)
   }
}

export const invalidateCache = ({ product, admin, order, orderId, userId, productId }: InvalidateCacheParam) => {
   if (product) {
      const productKeys: string[] = ['latest-products', 'product-categories', 'admin-products']

      if (productId && Array.isArray(productId)) {
         productId.forEach((id) => productKeys.push(`product-${id}`))
      }
      if (productId && typeof productId === 'string') {
         productKeys.push(`product-${productId}`)
      }

      myCache.del(productKeys)
   }
   if (order) {
      const orderKeys: string[] = ['all-orders', `order-${orderId}`, `myOrders-${userId}`]
      myCache.del(orderKeys)
   }
   if (admin) {
   }
}

export const getFromCache = <T>(key: string): T | null => {
   if (myCache.has(key)) {
      return JSON.parse(myCache.get(key) as string)
   } else {
      return null
   }
}

export const setCache = (key: string, value: any) => {
   myCache.set(key, JSON.stringify(value))
}
