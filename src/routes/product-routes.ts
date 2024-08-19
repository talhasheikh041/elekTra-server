import express from 'express'
import { multiUpload, singleUpload } from '../middlewares/multer.js'
import {
   deleteProduct,
   deleteReview,
   detailPhotoDelete,
   detailPhotoUpload,
   getAdminProducts,
   getAllCategories,
   getAllReviews,
   getLatestProducts,
   getSingleProduct,
   newProduct,
   newReview,
   searchAllProducts,
   updateProduct,
} from '../controllers/product-controllers.js'
import { adminOnly } from '../middlewares/auth.js'

const app = express.Router()

// Add new product  /api/v1/product/new
app.post('/new', adminOnly, multiUpload, newProduct)

// Get all products with filters (searchByName, sortByPrice, searchByCategory, searchByPrice)
// /api/v1/product/all
app.get('/all', searchAllProducts)

// Get 15 latest products /api/v1/product/latest
app.get('/latest', getLatestProducts)

// Get All categories /api/v1/product/categories
app.get('/categories', getAllCategories)

// Get all Products for admin only /api/v1/product/admin-products
app.get('/admin-products', adminOnly, getAdminProducts)

// Upload and delete photo in details section /api/v1/product/detailphoto
app.route('/detailphoto').post(singleUpload, detailPhotoUpload).delete(detailPhotoDelete)

// Add new review /api/v1/product/review/new/dynamicID
app.post('/review/new/:productId', newReview)

// Get all reviews /api/v1/product/review/all/dynamicID
app.get('/review/all/:productId', getAllReviews)

// Delete Review api/v1/product/review/dynamicID
app.delete('/review/:reviewId', deleteReview)

// Get, Update and delete single product /api/v1/product/dynamicID
app.route('/:id').get(getSingleProduct).put(adminOnly, multiUpload, updateProduct).delete(adminOnly, deleteProduct)

export default app
