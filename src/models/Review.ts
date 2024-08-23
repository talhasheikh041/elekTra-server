import mongoose from 'mongoose'

interface IReviewSchema {
   product: mongoose.Schema.Types.ObjectId
   user: string
   rating: number
   comment: string
}

const reviewSchema = new mongoose.Schema<IReviewSchema>(
   {
      product: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Product',
         required: true,
      },
      user: { type: String, ref: 'User', required: true },
      rating: {
         type: Number,
         required: [true, 'Please give Rating'],
         min: [0.5, 'Rating must be at least 1'],
         max: [5, 'Rating must not be more than 5'],
      },
      comment: { type: String, maxlength: [200, 'Comment must not be more than 200 characters'] },
   },
   { timestamps: true }
)

export const Review = mongoose.model('Review', reviewSchema)
