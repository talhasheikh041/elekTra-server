import mongoose from 'mongoose'
import { InvalidateCacheParam, OrderItemType } from '../types/types.js'
import { Product } from '../models/Product.js'
import { myCache } from '../app.js'
import { Review } from '../models/Review.js'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

export const connectDB = async (DATABASE_URI: string) => {
   try {
      const { connection } = await mongoose.connect(DATABASE_URI, { dbName: 'elektraDB' })
      console.log(`Connected to DB ${connection.host}`)
   } catch (error) {
      console.log(error)
   }
}

export const invalidateCache = ({
   product,
   admin,
   order,
   review,
   orderId,
   userId,
   productId,
}: InvalidateCacheParam) => {
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
      myCache.del(['admin-stats', 'admin-pie-charts', 'admin-bar-charts', 'admin-line-charts'])
   }

   if (review) {
      myCache.del([`reviews-${productId}`])
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

export const reduceStock = async (orderItems: OrderItemType[]) => {
   for (let item of orderItems) {
      const product = await Product.findById(item.productId)
      if (!product) throw new Error('Product not found')
      product.stock -= item.quantity
      await product.save()
   }
}

export const calculatePercentage = (currentMonthItems: number, lastMonthItems: number) => {
   if (lastMonthItems === 0) {
      return currentMonthItems * 100
   }

   const percent = (currentMonthItems / lastMonthItems) * 100
   return Number(percent.toFixed(0))
}

export const getCategoryPercentage = async ({
   allCategories,
   productCount,
}: {
   allCategories: string[]
   productCount: number
}) => {
   const categoriesCountQueries = allCategories.map((category) => Product.countDocuments({ category }))

   const categoriesCount = await Promise.all(categoriesCountQueries)

   const categoriesPercentage: Record<string, number> = allCategories.reduce((total, category, index) => {
      const count = categoriesCount[index]
      return {
         ...total,
         [category]: Number(((count / productCount) * 100).toFixed(0)),
      }
   }, {})

   return categoriesPercentage
}

interface MyDocument extends Document {
   createdAt: Date
   discount?: number
   total?: number
}

type GetChartDataType = {
   length: number
   docArr: MyDocument[]
   today: Date
   property?: 'discount' | 'total'
}

export const getChartData = ({ length, docArr, today, property }: GetChartDataType) => {
   const data: number[] = new Array(length).fill(0)

   // Fill the array by comparing the difference beteen present month and orderCreationMonth
   docArr.forEach((i) => {
      const dataCreationMonth = i.createdAt.getMonth()
      const monthDiff = (today.getMonth() - dataCreationMonth + 12) % 12

      if (monthDiff < length) {
         if (property) {
            data[length - monthDiff - 1] += i[property]!
         } else {
            data[length - monthDiff - 1] += 1
         }
      }
   })

   return data
}

export const findAverageRating = async (productId: mongoose.Types.ObjectId) => {
   const result = await Review.aggregate<{
      _id: string
      averageRating: number
      totalReviews: number
   }>([
      {
         $match: { product: productId },
      },
      {
         $group: {
            _id: '$product',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
         },
      },
      {
         $limit: 1,
      },
   ])

   return result[0]
}

export const uploadToCloudinary = async (photos: Express.Multer.File[]) => {
   const uploadedPhotos = await Promise.all(
      photos.map(async (photo) => {
         // Upload the image to Cloudinary with transformations
         const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader
               .upload_stream(
                  {
                     resource_type: 'image',
                     format: 'webp',
                  },
                  (error, uploadResult) => {
                     if (error) {
                        return reject(error)
                     }
                     return resolve(uploadResult!)
                  }
               )
               .end(photo.buffer)
         })

         return result
      })
   )

   return uploadedPhotos.map((photo) => ({
      public_id: photo.public_id,
      url: photo.secure_url,
   }))
}

export const deleteFromCloudinary = async (publicIds: string[]) => {
   const promises = publicIds.map((id) => {
      return new Promise<void>((resolve, reject) => {
         cloudinary.uploader.destroy(id, (error, result) => {
            if (error) return reject(error)
            resolve()
         })
      })
   })

   await Promise.all(promises)
}

export const extractImageIds = (htmlString: string): string[] | null => {
   const imgSrcRegex = /<img[^>]+src="([^">]+)"/g
   const cloudinaryIdRegex = /\/v\d+\/([^/]+)\.(?:jpg|jpeg|png|webp|gif)/

   let match: RegExpExecArray | null
   const imageIds: string[] = []

   // Loop through all matches of img src in the HTML string
   while ((match = imgSrcRegex.exec(htmlString)) !== null) {
      const srcUrl = match[1]
      const idMatch = cloudinaryIdRegex.exec(srcUrl)

      if (idMatch) {
         imageIds.push(idMatch[1])
      }
   }

   return imageIds.length > 0 ? imageIds : null
}
