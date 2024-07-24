import mongoose from 'mongoose'
import { OrderItemType, ShippingInfoType } from '../types/types.js'

interface IOrderSchema extends Document {
   shippingInfo: ShippingInfoType
   user: string
   subtotal: number
   tax: number
   shippingCharges: number
   discount: number
   total: number
   status: 'Processing' | 'Shipped' | 'Delivered'
   orderItems: OrderItemType[]
}

const orderSchema = new mongoose.Schema<IOrderSchema>(
   {
      shippingInfo: {
         address: {
            type: String,
            required: [true, 'Please provide address'],
         },
         city: {
            type: String,
            required: [true, 'Please provide city'],
         },
         state: {
            type: String,
            required: [true, 'Please provide state'],
         },
         country: {
            type: String,
            required: [true, 'Please provide country'],
         },
         pinCode: {
            type: Number,
            required: [true, 'Please provide pinCode'],
         },
      },

      user: {
         type: String,
         ref: 'User',
         required: true,
      },

      subtotal: {
         type: Number,
         required: true,
      },
      tax: {
         type: Number,
         required: true,
      },
      shippingCharges: {
         type: Number,
         default: 0,
         required: true,
      },
      discount: {
         type: Number,
         default: 0,
         required: true,
      },
      total: {
         type: Number,
         required: true,
      },
      status: {
         type: String,
         enum: ['Processing', 'Delivered', 'Shipped'],
         default: 'Processing',
      },

      orderItems: [
         {
            name: {
               type: String,
               required: [true, 'Please provide name'],
            },
            photo: {
               type: String,
               required: [true, 'Please provide photo'],
            },
            price: {
               type: Number,
               required: [true, 'Please provide price'],
            },
            quantity: {
               type: Number,
               required: [true, 'Please provide quantity'],
            },
            productId: {
               type: mongoose.Types.ObjectId,
               ref: 'Product',
            },
         },
      ],
   },
   {
      timestamps: true,
   }
)

export const Order = mongoose.model<IOrderSchema>('Order', orderSchema)
