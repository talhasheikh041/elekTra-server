import mongoose from 'mongoose'
import validator from 'validator'

interface IProductSchema extends Document {
   name: string
   price: number
   stock: number
   category: string
   shortDescription: string
   detail: string
   photos: {
      public_id: string
      url: string
   }[]
   rating?: number
   totalReviews?: number
   createdAt: Date
   updatedAt: Date
}

const productSchema = new mongoose.Schema<IProductSchema>(
   {
      name: {
         type: String,
         required: [true, 'Please provide product name'],
      },
      price: {
         type: Number,
         required: [true, 'Please provide product price'],
      },
      stock: {
         type: Number,
         required: [true, 'Please provide product stock'],
      },
      category: {
         type: String,
         required: [true, 'Please provide product category'],
         trim: true,
      },
      shortDescription: {
         type: String,
         required: [true, 'Please provide short Description'],
      },
      detail: {
         type: String,
         requried: [true, 'Please provide product detail'],
      },
      photos: [
         {
            public_id: {
               type: String,
               required: [true, 'Please enter Public ID'],
            },
            url: {
               type: String,
               required: [true, 'Please enter URL'],
            },
         },
      ],
      rating: {
         type: Number,
         default: 0,
      },
      totalReviews: {
         type: Number,
         default: 0,
      },
   },
   {
      timestamps: true,
   }
)

export const Product = mongoose.model<IProductSchema>('Product', productSchema)
