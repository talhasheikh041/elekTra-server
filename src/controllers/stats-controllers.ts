import { tryCatch } from '../middlewares/error.js'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { calculatePercentage, getFromCache, getCategoryPercentage, setCache, getChartData } from '../utils/features.js'

export const getDashboardStats = tryCatch(async (req, res) => {
   const cachedStats = getFromCache('admin-stats')

   if (cachedStats) {
      return res.status(200).json({
         success: true,
         stats: cachedStats,
      })
   }

   // Date Filters

   const today = new Date()

   const currentMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
   }
   const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
   }

   const sixMonthAgo = new Date()
   sixMonthAgo.setMonth(today.getMonth() - 6)

   // All DB Queries

   const currentMonthProductsQuery = Product.find({
      createdAt: {
         $gte: currentMonth.start,
         $lte: currentMonth.end,
      },
   })

   const lastMonthProductsQuery = Product.find({
      createdAt: {
         $gte: lastMonth.start,
         $lte: lastMonth.end,
      },
   })

   const currentMonthUsersQuery = User.find({
      createdAt: {
         $gte: currentMonth.start,
         $lte: currentMonth.end,
      },
   })

   const lastMonthUsersQuery = User.find({
      createdAt: {
         $gte: lastMonth.start,
         $lte: lastMonth.end,
      },
   })

   const currentMonthOrdersQuery = Order.find({
      createdAt: {
         $gte: currentMonth.start,
         $lte: currentMonth.end,
      },
   })

   const lastMonthOrdersQuery = Order.find({
      createdAt: {
         $gte: lastMonth.start,
         $lte: lastMonth.end,
      },
   })

   const lastSixMonthOrdersQuery = Order.find({
      createdAt: {
         $gte: sixMonthAgo,
         $lte: today,
      },
   })

   const [
      currentMonthProducts,
      lastMonthProducts,
      currentMonthUsers,
      lastMonthUsers,
      currentMonthOrders,
      lastMonthOrders,
      productCount,
      usersCount,
      totalOrders,
      lastSixMonthOrders,
      allCategories,
      maleUsersCount,
      latestTransactions,
   ] = await Promise.all([
      currentMonthProductsQuery,
      lastMonthProductsQuery,
      currentMonthUsersQuery,
      lastMonthUsersQuery,
      currentMonthOrdersQuery,
      lastMonthOrdersQuery,
      Product.countDocuments(),
      User.countDocuments(),
      Order.find().select('total'),
      lastSixMonthOrdersQuery,
      Product.distinct('category'),
      User.countDocuments({ gender: 'male' }),
      Order.find().select(['orderItems', 'discount', 'total', 'status', 'user']).populate('user', 'name').limit(4),
   ])

   // Calculate Count

   const ordersCount = totalOrders.length
   const totalRevenue = totalOrders.reduce((total, order) => order.total + total, 0)

   // Calculate Percentage Difference between first month and last month

   const lastMonthRevenue = lastMonthOrders.reduce((total, order) => order.total + total, 0)
   const currentMonthRevenue = currentMonthOrders.reduce((total, order) => order.total + total, 0)

   const percentageChangeProducts = calculatePercentage(currentMonthProducts.length, lastMonthProducts.length)
   const percentageChangeOrders = calculatePercentage(currentMonthOrders.length, lastMonthOrders.length)
   const percentageChangeUsers = calculatePercentage(currentMonthUsers.length, lastMonthUsers.length)
   const percentageChangeRevenue = calculatePercentage(currentMonthRevenue, lastMonthRevenue)

   // Revenue and Transactions

   const lastSixMonthsOrderCount = new Array(6).fill(0)
   const lastSixMonthsRevenue = new Array(6).fill(0)

   // Fill the array by comparing the difference beteen present month and orderCreationMonth
   lastSixMonthOrders.forEach((order) => {
      const orderCreationMonth = order.createdAt.getMonth()
      const monthDiff = (today.getMonth() - orderCreationMonth + 12) % 12

      if (monthDiff < 6) {
         lastSixMonthsOrderCount[6 - monthDiff - 1] += 1
         lastSixMonthsRevenue[6 - monthDiff - 1] += order.total
      }
   })

   // Inventory (Categories percentage)

   const categoryPercentage = await getCategoryPercentage({ allCategories, productCount })

   //  Male Female Ratio
   const femaleUserCount = usersCount - maleUsersCount

   // Latest Transactions
   const finalLatestTransactions = latestTransactions.map((transaction) => ({
      _id: transaction._id,
      discount: transaction.discount,
      status: transaction.status,
      quantity: transaction.orderItems.length,
      user: transaction.user,
      amount: transaction.total,
   }))

   const stats = {
      percentage: {
         products: percentageChangeProducts,
         orders: percentageChangeOrders,
         users: percentageChangeUsers,
         revenue: percentageChangeRevenue,
      },
      count: {
         product: productCount,
         orders: ordersCount,
         users: usersCount,
         totalRevenue,
      },
      barChart: {
         order: lastSixMonthsOrderCount,
         revenue: lastSixMonthsRevenue,
      },
      categories: categoryPercentage,
      userRatio: {
         male: maleUsersCount,
         female: femaleUserCount,
      },
      latestTransactions: finalLatestTransactions,
   }

   setCache('admin-stats', stats)

   res.status(200).json({
      success: true,
      stats,
   })
})

export const getPieCharts = tryCatch(async (req, res) => {
   const cachedPieCharts = getFromCache('admin-pie-charts')

   if (cachedPieCharts) {
      return res.status(200).json({
         success: true,
         pieCarts: cachedPieCharts,
      })
   }

   const [
      processing,
      shipped,
      delivered,
      allCategories,
      productCount,
      productOutOfStock,
      allOrders,
      allUsers,
      adminCount,
      customerCount,
   ] = await Promise.all([
      Order.countDocuments({ status: 'Processing' }),
      Order.countDocuments({ status: 'Shipped' }),
      Order.countDocuments({ status: 'Delivered' }),
      Product.distinct('category'),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      Order.find(),
      User.find().select('dob'),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'user' }),
   ])

   // Order fulfilllment Ratio

   const orderFulfillmentRatio = {
      processing,
      shipped,
      delivered,
   }

   // Product Categories Percentage

   const categoryPercentage = await getCategoryPercentage({ allCategories, productCount })

   // Stock Availability
   const productInStock = productCount - productOutOfStock

   const stockAvailability = {
      inStock: productInStock,
      outOfStock: productOutOfStock,
   }

   // Revenue Distribution

   const calculateRevenueDist = allOrders.reduce(
      (result, order) => {
         result.grossIncome += order.total || 0
         result.discount += order.discount || 0
         result.productionCost += order.shippingCharges || 0
         result.burnt += order.tax || 0

         return result
      },
      {
         marketingCost: 0,
         discount: 0,
         burnt: 0,
         productionCost: 0,
         grossIncome: 0,
      }
   )
   const { burnt, discount, grossIncome, marketingCost, productionCost } = calculateRevenueDist

   const revenueDistribution = {
      marketingCost: Math.round(calculateRevenueDist.grossIncome * (30 / 100)),
      discount,
      burnt,
      productionCost,
      netMargin: grossIncome - discount - burnt - marketingCost,
   }

   // User age group
   const userAgeGroup = {
      teen: allUsers.filter((user) => user.age < 20).length,
      adult: allUsers.filter((user) => user.age >= 20 && user.age <= 40).length,
      old: allUsers.filter((user) => user.age > 40).length,
   }

   // User count
   const userCount = {
      admin: adminCount,
      customer: customerCount,
   }

   const pieCarts = {
      orderFulfillmentRatio,
      productCategoriesRatio: categoryPercentage,
      stockAvailability,
      revenueDistribution,
      userAgeGroup,
      userCount,
   }

   setCache('admin-pie-charts', pieCarts)

   res.status(200).json({
      success: true,
      pieCarts,
   })
})
export const getBarCharts = tryCatch(async (req, res) => {
   const key = 'admin-bar-charts'

   const cachedBarCharts = getFromCache(key)

   if (cachedBarCharts) {
      return res.status(200).json({
         success: true,
         barCarts: cachedBarCharts,
      })
   }

   const today = new Date()
   const sixMonthAgo = new Date()
   sixMonthAgo.setMonth(today.getMonth() - 6)
   const twelveMonthAgo = new Date()
   twelveMonthAgo.setMonth(today.getMonth() - 12)

   const sixMonthAgoProductsQuery = Product.find({
      createdAt: {
         $gte: sixMonthAgo,
         $lte: today,
      },
   })

   const sixMonthAgoUsersQuery = User.find({
      createdAt: {
         $gte: sixMonthAgo,
         $lte: today,
      },
   })

   const twelveMonthAgoOrdersQuery = Order.find({
      createdAt: {
         $gte: twelveMonthAgo,
         $lte: today,
      },
   })

   const [products, users, orders] = await Promise.all([
      sixMonthAgoProductsQuery,
      sixMonthAgoUsersQuery,
      twelveMonthAgoOrdersQuery,
   ])

   // Calcualte last month Data

   const sixMonthProductCount = getChartData({ length: 6, docArr: products, today })
   const sixMonthUserCount = getChartData({ length: 6, docArr: users, today })
   const twelveMonthOrderCount = getChartData({ length: 12, docArr: orders, today })

   const barCharts = {
      products: sixMonthProductCount,
      users: sixMonthUserCount,
      orders: twelveMonthOrderCount,
   }

   setCache(key, barCharts)

   return res.status(200).json({
      success: true,
      barCarts: barCharts,
   })
})
export const getLineCharts = tryCatch(async (req, res) => {
   const key = 'admin-line-charts'

   const cachedLineCharts = getFromCache(key)

   if (cachedLineCharts) {
      return res.status(200).json({
         success: true,
         lineCarts: cachedLineCharts,
      })
   }

   const today = new Date()

   const twelveMonthsAgo = new Date()
   twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

   const baseQuery = {
      createdAt: {
         $gte: twelveMonthsAgo,
         $lte: today,
      },
   }

   const [products, users, orders] = await Promise.all([
      Product.find(baseQuery).select('createdAt'),
      User.find(baseQuery).select('createdAt'),
      Order.find(baseQuery).select(['createdAt', 'discount', 'total']),
   ])

   const productCounts = getChartData({ length: 12, today, docArr: products })
   const usersCounts = getChartData({ length: 12, today, docArr: users })
   const discount = getChartData({
      length: 12,
      today,
      docArr: orders,
      property: 'discount',
   })
   const revenue = getChartData({
      length: 12,
      today,
      docArr: orders,
      property: 'total',
   })

   const lineCharts = {
      users: usersCounts,
      products: productCounts,
      discount,
      revenue,
   }

   setCache(key, lineCharts)

   return res.status(200).json({
      success: true,
      lineCharts,
   })
})
