import mongoose from 'mongoose'

interface IProductSchema extends Document {
   name: string
   price: number
   stock: number
   category: string
   photo: string
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
      photo: {
         type: String,
         required: [true, 'Please provide product photo'],
      },
   },
   {
      timestamps: true,
   }
)

export const Product = mongoose.model<IProductSchema>('Product', productSchema)
