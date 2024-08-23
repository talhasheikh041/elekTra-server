import mongoose from 'mongoose'

interface ICouponSchema extends Document {
   coupon: string
   discount: number
}

const couponSchema = new mongoose.Schema<ICouponSchema>({
   coupon: {
      type: String,
      required: [true, 'Please provide coupon value'],
      unique: true,
   },
   discount: {
      type: Number,
      required: [true, 'Please provide discount amount'],
   },
})

export const Coupon = mongoose.model<ICouponSchema>('Coupon', couponSchema)
