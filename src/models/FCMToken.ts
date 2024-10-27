import mongoose from 'mongoose'

interface IFCMTokenSchema extends Document {
   user: string
   token: string
   createdAt: Date
   updatedAt: Date
}

const FCMTokenSchema = new mongoose.Schema<IFCMTokenSchema>(
   {
      user: {
         type: String,
         ref: 'User',
         required: true,
      },
      token: {
         type: String,
         required: true,
      },
   },
   {
      timestamps: true,
   }
)

export const FCMToken = mongoose.model<IFCMTokenSchema>('FCMToken', FCMTokenSchema)
