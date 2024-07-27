import { Request, Response } from 'express'
import { tryCatch } from '../middlewares/error.js'
import { INewProductRequestBody, ISearchBaseQuery, ISearchRequestQuery } from '../types/types.js'
import ErrorHandler from '../utils/utility-class.js'
import { rm } from 'fs'
import { Product } from '../models/Product.js'
import { isValidObjectId } from 'mongoose'
import { myCache } from '../app.js'
import { getFromCache, invalidateCache, setCache } from '../utils/features.js'

export const newProduct = tryCatch(async (req: Request<{}, {}, INewProductRequestBody>, res: Response) => {
   const { name, category, price, stock } = req.body
   const photo = req.file

   if (!photo) throw new ErrorHandler('Please provide product photo', 400)

   if (!name || !category || !price || !stock) {
      rm(photo.path, (err) => {
         err && console.log(err)
      })
      throw new ErrorHandler('Please provide all the fields', 400)
   }

   const product = await Product.create({
      name,
      price,
      stock,
      category: category.toLocaleLowerCase(),
      photo: photo.path,
   })

   if (!product) throw new ErrorHandler('Product cannot be created! Check Database for errors!', 400)

   invalidateCache({ product: true, admin: true })

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
         latestProducts: cachedLatestProducts,
      })
   }

   const latestProducts = await Product.find().sort({ createdAt: 'desc' }).limit(15)
   setCache('latest-products', latestProducts)

   if (!latestProducts.length) throw new ErrorHandler('No Latest Products Found', 404)

   res.status(200).json({
      success: true,
      latestProducts,
   })
})

export const getAllCategories = tryCatch(async (req, res) => {
   const cachedProductCategories = getFromCache('product-categories')

   if (cachedProductCategories) {
      return res.status(200).json({
         success: true,
         productCategories: cachedProductCategories,
      })
   }

   const productCategories = await Product.distinct('category')
   setCache('product-categories', productCategories)

   if (!productCategories.length) throw new ErrorHandler('No Categories Found', 404)

   res.status(200).json({
      success: true,
      productCategories,
   })
})

export const getAdminProducts = tryCatch(async (req, res) => {
   const cachedAdminProducts = getFromCache('admin-products')

   if (cachedAdminProducts) {
      return res.status(200).json({
         success: true,
         allProducts: cachedAdminProducts,
      })
   }

   const adminProducts = await Product.find()
   setCache('admin-products', adminProducts)

   if (!adminProducts.length) throw new ErrorHandler('No Categories Found', 404)

   res.status(200).json({
      success: true,
      allProducts: adminProducts,
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
   const { name, price, stock, category } = req.body
   const photo = req.file

   if (!isValidObjectId(id)) throw new ErrorHandler('Invalid Product ID', 400)

   const product = await Product.findById(id)

   if (!product) throw new ErrorHandler('No product found', 404)

   if (photo) {
      rm(product.photo, (err) => err && console.log('Old Photo Deleted'))
      product.photo = photo.path
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

   rm(product.photo, (err) => err && console.log(err))
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
         .sort(sort && { price: sort === 'asc' ? 'asc' : 'desc' })
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
