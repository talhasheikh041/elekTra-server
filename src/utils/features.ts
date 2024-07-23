import mongoose from 'mongoose'
import { InvalidateCacheParam } from '../types/types.js'
import { Product } from '../models/Product.js'
import { myCache } from '../app.js'

export const connectDB = async () => {
   try {
      const { connection } = await mongoose.connect('mongodb://localhost:27017/', { dbName: 'elektraDB' })
      console.log(`Connected to DB ${connection.host}`)
   } catch (error) {
      console.log(error)
   }
}

export const invalidateCache = async ({ product, admin, order }: InvalidateCacheParam) => {
   if (product) {
      const productKeys: string[] = ['latest-products', 'product-categories', 'admin-products']
      const productIDs = await Product.find().select('_id')

      productIDs.forEach((i) => {
         productKeys.push(`product-${i._id}`)
      })

      myCache.del(productKeys)
   }
   if (admin) {
   }
   if (order) {
   }
}
