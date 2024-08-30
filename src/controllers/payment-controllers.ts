import { isValidObjectId } from 'mongoose'
import { tryCatch } from '../middlewares/error.js'
import { Coupon } from '../models/Coupon.js'
import ErrorHandler from '../utils/utility-class.js'
import { stripe } from '../app.js'

export const createPaymentIntent = tryCatch(async (req, res) => {
   const amount = req.body.amount
   const convertedAmount = Number(amount) * 100

   if (!amount) throw new ErrorHandler('Please provide amount', 400)

   const paymentIntent = await stripe.paymentIntents.create({ amount: convertedAmount, currency: 'usd' })

   res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
   })
})

export const newCoupon = tryCatch(async (req, res) => {
   const { coupon, discount } = req.body

   if (!coupon || !discount) throw new ErrorHandler('Please provide coupon and discount', 400)

   const newCoupon = await Coupon.create({ coupon, discount })

   if (!newCoupon) throw new ErrorHandler('Coupon cannot be created. Check database', 400)

   res.status(201).json({
      success: true,
      message: `Coupon ${coupon} created successfully`,
   })
})
export const applyDiscount = tryCatch(async (req, res) => {
   const { coupon, total } = req.query

   if (!coupon || !total) throw new ErrorHandler('Please provide coupon and total amount', 400)

   const storedCoupon = await Coupon.findOne({ coupon })

   if (!storedCoupon) throw new ErrorHandler('Invalid Coupon', 400)

   const discount = (Number(total) * storedCoupon.discount) / 100

   res.status(200).json({
      success: true,
      discount,
   })
})
export const allCoupons = tryCatch(async (req, res) => {
   const allCoupons = await Coupon.find()
   if (!allCoupons.length) throw new ErrorHandler('No coupons found', 404)

   res.status(200).json({
      success: true,
      allCoupons,
   })
})
export const deleteCoupon = tryCatch(async (req, res) => {
   const { couponId } = req.params

   if (!isValidObjectId(couponId)) throw new ErrorHandler('Invalid Product ID', 400)

   if (!couponId) throw new ErrorHandler('Please provide coupon ID', 404)

   const deletedCoupon = await Coupon.findByIdAndDelete(couponId)

   if (!deletedCoupon) throw new ErrorHandler('Invalid coupon', 400)

   res.status(200).json({
      success: true,
      message: `Coupon ${deletedCoupon.coupon} deleted successfully`,
   })
})
