import { NextFunction, Request, Response } from 'express'
import { INewUserRequestBody } from '../types/types.js'
import ErrorHandler from '../utils/utility-class.js'
import { tryCatch } from '../middlewares/error.js'
import { User } from '../models/User.js'

export const newUser = tryCatch(
   async (req: Request<{}, {}, INewUserRequestBody>, res: Response, next: NextFunction) => {
      const { _id, dob, email, gender, name, photo } = req.body

      let user = await User.findById(_id)

      if (user) {
         return res.status(200).json({
            success: true,
            message: `${user.name} logged in successfully!`,
         })
      }

      if (!_id || !dob || !email || !gender || !name || !photo) {
         throw new ErrorHandler('Please provide all the fields', 400)
      }

      user = await User.create({
         _id,
         email,
         gender,
         name,
         photo,
         dob: new Date(dob),
      })

      return res.status(200).json({
         success: true,
         message: `User ${user.name} is created!`,
      })
   }
)

export const allUsers = tryCatch(async (req, res, next) => {
   const users = await User.find().lean()

   if (!users.length) {
      throw new ErrorHandler('No users found!', 404)
   }

   return res.status(200).json({
      success: true,
      users,
   })
})

export const getUser = tryCatch(async (req, res, next) => {
   const { id } = req.params

   const user = await User.findById(id)

   if (!user) {
      throw new ErrorHandler('No User found!', 404)
   }

   return res.status(200).json({
      success: true,
      user,
   })
})

export const deleteUser = tryCatch(async (req, res, next) => {
   const { id } = req.params

   const user = await User.findById(id)

   if (!user) {
      throw new ErrorHandler('No User found!', 404)
   }

   await user.deleteOne()

   return res.status(200).json({
      success: true,
      message: `User "${user.name}" deleted successfully!`,
   })
})

export const updateUser = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const { role } = req.body
   const adminId = req.query.id

   if (!id || !role) throw new ErrorHandler('Please provide user credentials', 400)

   if (adminId === id) throw new ErrorHandler('User cannot change his own role', 400)

   const user = await User.findById(id)

   if (!user) {
      throw new ErrorHandler('No User found!', 404)
   }

   user.role = role

   const updatedUser = await user.save()

   if (!updatedUser) throw new ErrorHandler('Cannot update the user', 400)

   return res.status(200).json({
      success: true,
      message: 'User updated successfully',
   })
})
