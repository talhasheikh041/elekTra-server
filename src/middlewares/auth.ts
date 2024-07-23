import { User } from '../models/User.js'
import ErrorHandler from '../utils/utility-class.js'
import { tryCatch } from './error.js'

export const adminOnly = tryCatch(async (req, res, next) => {
   const id = req.query.id

   if (!id) throw new ErrorHandler('You should log in first!', 401)

   const user = await User.findById(id)

   if (!user) throw new ErrorHandler('Invalid User ID. No User found!', 401)

   if (user.role !== 'admin') throw new ErrorHandler('Only Admin can access this resource!', 401)

   next()
})
