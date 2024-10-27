import express from 'express'
import { tryCatch } from '../middlewares/error.js'
import { FCMToken } from '../models/FCMToken.js'
import ErrorHandler from '../utils/utility-class.js'

const app = express.Router()

app.post(
   '/store-token',
   tryCatch(async (req, res) => {
      const { token, userId } = req.body

      if (!token || !userId) throw new ErrorHandler("User ID or Token is missing", 400)

      const savedToken = await FCMToken.findOne({ user: userId })

      if (savedToken) {
         savedToken.token = token
         savedToken.save()

         return res.status(200).json({
            success: true,
            message: 'FCM Token updated successfully',
         })
      }

      const newToken = FCMToken.create({
         user: userId,
         token: token,
      })

      if (!newToken) throw new ErrorHandler('Cannot Store FCM Token', 400)

      return res.status(200).json({
         success: true,
         message: 'Token saved successfully',
      })
   })
)

export default app