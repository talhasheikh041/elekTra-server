import mongoose from 'mongoose'
import validator from 'validator'

interface IUserSchema extends Document {
   _id: string
   name: string
   email: string
   photo: string
   role: 'admin' | 'user'
   gender: 'male' | 'female'
   dob: Date
   createdAt: Date
   updatedAt: Date
   // virtua; attribute
   age: number
}

const userSchema = new mongoose.Schema<IUserSchema>(
   {
      _id: {
         type: String,
         required: [true, 'Please enter _id'],
      },
      name: {
         type: String,
         required: [true, 'Please enter your name'],
      },
      email: {
         type: String,
         unique: true,
         required: [true, 'Please enter your email'],
         validate: validator.default.isEmail,
      },
      photo: {
         type: String,
         required: [true, 'Please upload photo'],
      },
      gender: {
         type: String,
         enum: ['male', 'female'],
         required: [true, 'Please provide your gender'],
      },
      role: {
         type: String,
         enum: ['user', 'admin'],
         default: 'user',
      },
      dob: {
         type: Date,
         required: [true, 'Please enter your date of birth'],
      },
   },
   {
      timestamps: true,
   }
)

userSchema.virtual('age').get(function () {
   const today = new Date()
   const dob = this.dob
   let age = today.getFullYear() - dob.getFullYear()

   if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
      age--
   }

   return age
})

export const User = mongoose.model<IUserSchema>('User', userSchema)
