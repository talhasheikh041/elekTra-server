import express from 'express'
import { adminOnly } from '../middlewares/auth.js'
import {
   allCoupons,
   applyDiscount,
   createPaymentIntent,
   deleteCoupon,
   newCoupon,
} from '../controllers/payment-controllers.js'

const app = express.Router()

// route - /api/v1/payment/create
app.post('/create', createPaymentIntent)

// route - /api/v1/payment/coupon/new
app.post('/coupon/new', adminOnly, newCoupon)

// route - /api/v1/payment/discount
app.get('/discount', applyDiscount)

// route - /api/v1/payment/coupon/all
app.get('/coupon/all', allCoupons)

// route - /api/v1/payment/coupon/:couponId
app.delete('/coupon/:couponId', deleteCoupon)

export default app
