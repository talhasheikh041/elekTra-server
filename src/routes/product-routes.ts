import express from 'express'
import { singleUpload } from '../middlewares/multer.js'
import {
   deleteProduct,
   getAdminProducts,
   getAllCategories,
   getLatestProducts,
   getSingleProduct,
   newProduct,
   searchAllProducts,
   updateProduct,
} from '../controllers/product-controllers.js'
import { adminOnly } from '../middlewares/auth.js'

const app = express.Router()

// Add new product  /api/v1/product/new
app.post('/new', adminOnly, singleUpload, newProduct)

// Get all products with filters (searchByName, sortByPrice, searchByCategory, searchByPrice)
// /api/v1/product/all
app.get('/all', searchAllProducts)

// Get 15 latest products /api/v1/product/latest
app.get('/latest', getLatestProducts)

// Get All categories /api/v1/product/categories
app.get('/categories', getAllCategories)

// Get all Products for admin only /api/v1/product/admin-products
app.get('/admin-products', adminOnly, getAdminProducts)

// Get, Update and delete single product /api/v1/product/dynamicID
app.route('/:id').get(getSingleProduct).put(adminOnly, singleUpload, updateProduct).delete(adminOnly, deleteProduct)

export default app
