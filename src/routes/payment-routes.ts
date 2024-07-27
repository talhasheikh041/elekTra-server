import express from 'express'
import { adminOnly } from '../middlewares/auth.js'
import { allCoupons, applyDiscount, deleteCoupon, newCoupon } from '../controllers/payment-controllers.js'

const app = express.Router()

// route - /api/v1/coupon/new
app.post('/coupon/new', adminOnly, newCoupon)

// route - /api/v1/discount
app.get('/discount', applyDiscount)

// route - /api/v1/coupon/all
app.get('/coupon/all', allCoupons)

// route - /api/v1/coupon/:couponId
app.delete('/coupon/:couponId', deleteCoupon)

export default app
