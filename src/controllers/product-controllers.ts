import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { Request, Response } from 'express'
import { isValidObjectId } from 'mongoose'
import sanitizeHtml from 'sanitize-html'
import { tryCatch } from '../middlewares/error.js'
import { Product } from '../models/Product.js'
import { Review } from '../models/Review.js'
import { User } from '../models/User.js'
import { INewProductRequestBody, ISearchBaseQuery, ISearchRequestQuery } from '../types/types.js'
import {
   deleteFromCloudinary,
   findAverageRating,
   getFromCache,
   invalidateCache,
   setCache,
   uploadToCloudinary,
} from '../utils/features.js'
import ErrorHandler from '../utils/utility-class.js'

export const newProduct = tryCatch(async (req: Request<{}, {}, INewProductRequestBody>, res: Response) => {
   const { name, category, price, stock, shortDescription, detail } = req.body
   const photos = req.files as Express.Multer.File[] | undefined

   if (!photos) throw new ErrorHandler('Please provide product photo', 400)

   if (photos.length < 1) throw new ErrorHandler('Please add atleast one photo', 400)

   if (photos.length > 6) throw new ErrorHandler('You can only upload 6 Photos', 400)

   if (!name || !category || !price || !stock || !shortDescription || !detail) {
      throw new ErrorHandler('Please provide all the fields', 400)
   }

   const uploadedPhotos = await uploadToCloudinary(photos)

   const cleanDetail = sanitizeHtml(detail, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
         ...sanitizeHtml.defaults.allowedAttributes,
         '*': ['class'], // Allow the `class` attribute on all elements
      },
   })

   const product = await Product.create({
      name,
      price,
      stock,
      category: category.toLocaleLowerCase(),
      photos: uploadedPhotos,
      shortDescription,
      detail: cleanDetail,
   })

   if (!product) throw new ErrorHandler('Product cannot be created! Check Database for errors!', 400)

   invalidateCache({ product: true, admin: true })

   res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';")

   res.status(200).json({
      success: true,
      message: 'Product created successfully',
   })
})

export const getLatestProducts = tryCatch(async (req, res) => {
   const cachedLatestProducts = getFromCache('latest-products')

   if (cachedLatestProducts) {
      return res.status(200).json({
         success: true,
         products: cachedLatestProducts,
      })
   }

   const latestProducts = await Product.find().sort({ createdAt: 'desc' }).limit(15)

   if (!latestProducts.length) throw new ErrorHandler('No Latest Products Found', 404)

   setCache('latest-products', latestProducts)

   res.status(200).json({
      success: true,
      products: latestProducts,
   })
})

export const getAllCategories = tryCatch(async (req, res) => {
   const cachedProductCategories = getFromCache('product-categories')

   if (cachedProductCategories) {
      return res.status(200).json({
         success: true,
         categories: cachedProductCategories,
      })
   }

   const productCategories = await Product.distinct('category')
   setCache('product-categories', productCategories)

   if (!productCategories.length) throw new ErrorHandler('No Categories Found', 404)

   res.status(200).json({
      success: true,
      categories: productCategories,
   })
})

export const getAdminProducts = tryCatch(async (req, res) => {
   const cachedAdminProducts = getFromCache('admin-products')

   if (cachedAdminProducts) {
      return res.status(200).json({
         success: true,
         products: cachedAdminProducts,
      })
   }

   const adminProducts = await Product.find()
   setCache('admin-products', adminProducts)

   if (!adminProducts.length) throw new ErrorHandler('No Products Found', 404)

   res.status(200).json({
      success: true,
      products: adminProducts,
   })
})

export const getSingleProduct = tryCatch(async (req, res) => {
   const id = req.params.id

   if (!id) throw new ErrorHandler('Please provide product ID', 400)

   if (!isValidObjectId(id)) throw new ErrorHandler('Invalid Product ID', 400)

   const cachedProduct = getFromCache(`product-${id}`)

   if (cachedProduct) {
      return res.status(200).json({
         success: true,
         product: cachedProduct,
      })
   }

   const product = await Product.findById(id)
   setCache(`product-${id}`, product)

   if (!product) throw new ErrorHandler('No product found', 404)

   res.status(200).json({
      success: true,
      product,
   })
})

export const updateProduct = tryCatch(async (req, res) => {
   const id = req.params.id
   const { name, price, stock, category, shortDescription, detail } = req.body
   const photos = req.files as Express.Multer.File[] | undefined

   if (!isValidObjectId(id)) throw new ErrorHandler('Invalid Product ID', 400)

   const product = await Product.findById(id)

   if (!product) throw new ErrorHandler('No product found', 404)

   if (photos && photos.length > 0) {
      const photosURL = await uploadToCloudinary(photos)

      const ids = product.photos.map((photo) => photo.public_id)

      await deleteFromCloudinary(ids)

      product.photos = photosURL
   }

   if (name) product.name = name
   if (price) product.price = price
   if (stock) product.stock = stock
   if (category) product.category = category

   const updatedProduct = await product.save()

   if (!updatedProduct) throw new ErrorHandler('Cannot update the product! Check database', 400)

   invalidateCache({ product: true, admin: true, productId: id })

   res.status(200).json({
      success: true,
      message: 'Product successfully updated',
   })
})

export const deleteProduct = tryCatch(async (req, res) => {
   const id = req.params.id

   const product = await Product.findById(id)

   if (!product) throw new ErrorHandler('No product found', 404)

   const ids = product.photos.map((photo) => photo.public_id)
   await deleteFromCloudinary(ids)

   await product.deleteOne()

   invalidateCache({ product: true, admin: true, productId: id })

   res.status(200).json({
      success: true,
      message: 'Product Deleted Successfully',
   })
})

export const searchAllProducts = tryCatch(async (req: Request<{}, {}, {}, ISearchRequestQuery>, res) => {
   const { search, category, price, sort } = req.query
   const page = Number(req.query.page) || 1

   const limit = Number(process.env.PRODUCT_PER_PAGE) || 8
   const skip = (page - 1) * limit

   const baseQuery: ISearchBaseQuery = {}

   if (search) {
      baseQuery.name = {
         $regex: search,
         $options: 'i',
      }
   }

   if (price) {
      baseQuery.price = {
         $lte: Number(price),
      }
   }

   if (category) {
      baseQuery.category = category
   }

   const [paginatedFilteredProducts, allFilteredProducts] = await Promise.all([
      Product.find(baseQuery)
         .sort(sort ? { price: sort === 'asc' ? 'asc' : 'desc' } : {})
         .limit(limit)
         .skip(skip),
      Product.find(baseQuery),
   ])

   if (!paginatedFilteredProducts.length) throw new ErrorHandler('No products found', 404)

   const totalPages = Math.ceil(allFilteredProducts.length / limit)

   res.status(200).json({
      success: true,
      products: paginatedFilteredProducts,
      totalPages,
   })
})

export const newReview = tryCatch(async (req, res) => {
   const { id: userId } = req.query
   const { productId } = req.params
   const { rating, comment } = req.body

   if (!userId) throw new ErrorHandler('You have to login first', 403)

   if (!productId) throw new ErrorHandler('Please provide the product ID', 400)

   if (!rating || !comment) throw new ErrorHandler('Please provide the rating and comment', 400)

   const user = await User.findById(userId)

   if (!user) throw new ErrorHandler('Invalid userId', 403)

   const product = await Product.findById(productId)

   if (!product) throw new ErrorHandler('No such product', 403)

   const reviewAlreadyPresent = await Review.findOne({ product: productId, user: userId })

   if (reviewAlreadyPresent) {
      reviewAlreadyPresent.rating = rating
      reviewAlreadyPresent.comment = comment
      await reviewAlreadyPresent.save()
   } else {
      await Review.create({
         user: user._id,
         product: product._id,
         rating: rating,
         comment: comment,
      })
   }

   const { averageRating, totalReviews } = await findAverageRating(product._id)

   product.rating = averageRating
   product.totalReviews = totalReviews

   await product.save()

   invalidateCache({
      admin: true,
      product: true,
      review: true,
      productId: String(product._id),
   })

   return res.status(reviewAlreadyPresent ? 200 : 201).json({
      success: true,
      message: reviewAlreadyPresent ? 'Review updated' : 'Review Added',
   })
})

export const getAllReviews = tryCatch(async (req, res) => {
   const { productId } = req.params

   if (!productId) throw new ErrorHandler('Please provide the product ID', 400)

   if (!isValidObjectId(productId)) throw new ErrorHandler('Invalid Product ID', 400)

   const cachedReviews = getFromCache(`reviews-${productId}`)

   if (cachedReviews) {
      return res.status(200).json({
         success: true,
         reviews: cachedReviews,
      })
   }

   const reviews = await Review.find({ product: productId }).populate('user', 'name photo').sort({ updatedAt: 'desc' })

   if (!reviews.length) throw new ErrorHandler('No reviews for this product', 404)

   setCache(`reviews-${productId}`, reviews)

   res.status(200).json({
      success: true,
      reviews,
   })
})

export const deleteReview = tryCatch(async (req, res) => {
   const { reviewId } = req.params
   const { id: userId } = req.query

   if (!userId) throw new ErrorHandler('You have to login first', 403)

   if (!reviewId) throw new ErrorHandler('Please provide the review ID', 400)

   if (!isValidObjectId(reviewId)) throw new ErrorHandler('Invalid Review ID', 400)

   const user = await User.findById(userId)

   if (!user) throw new ErrorHandler('Invalid userId', 403)

   const review = await Review.findById(reviewId)
   if (!review) throw new ErrorHandler('No such review', 404)

   const isAuthenticUser = review.user.toString() === user._id.toString()

   if (!isAuthenticUser) throw new ErrorHandler('Not Authorized', 401)

   await review.deleteOne()

   const product = await Product.findById(review.product)

   if (!product) throw new ErrorHandler('Product Not Found', 404)

   await review.deleteOne()

   const { averageRating, totalReviews } = await findAverageRating(product._id)

   product.rating = averageRating
   product.totalReviews = totalReviews

   await product.save()

   invalidateCache({
      product: true,
      productId: String(product._id),
      admin: true,
      review: true,
   })

   res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
   })
})

export const detailPhotoUpload = tryCatch(async (req, res) => {
   const photo = req.file

   if (!photo) throw new ErrorHandler('Please provide photo', 400)

   const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
         .upload_stream(
            {
               resource_type: 'image',
               format: 'webp',
            },
            (error, uploadResult) => {
               if (error) {
                  return reject(error)
               }
               return resolve(uploadResult!)
            }
         )
         .end(photo.buffer)
   })

   res.status(200).json({
      success: true,
      url: result.secure_url,
   })
})

export const detailPhotoDelete = tryCatch(async (req, res) => {
   const { publicId } = req.body

   const response = await new Promise<{ result: string }>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error: any, result: any) => {
         if (error) return reject(error)
         resolve(result)
      })
   })

   if (response.result === 'ok') {
      res.status(200).json({
         success: true,
         message: 'Photo deleted successfully',
      })
   } else {
      throw new ErrorHandler('Error deleting the photo', 400)
   }
})
