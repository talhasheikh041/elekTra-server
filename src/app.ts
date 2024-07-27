import express from 'express'
import NodeCache from 'node-cache'
import path from 'path'
import 'dotenv/config'

// Routes imports
import userRoutes from './routes/user-routes.js'
import productRoutes from './routes/product-routes.js'
import orderRoutes from './routes/order-routes.js'
import paymentRoutes from './routes/payment-routes.js'
import statsRoutes from './routes/stats-routes.js'

// Middleware imports
import { errorMiddleware } from './middlewares/error.js'
import morgan from 'morgan'

// Utils imports
import { connectDB } from './utils/features.js'

const PORT = process.env.PORT || 3000
const app = express()
export const myCache = new NodeCache()

connectDB()

app.use(morgan('dev'))

app.use(express.json())

app.use('/uploads', express.static(path.join(import.meta.dirname, 'uploads')))

// routes
app.get('/', (req, res) => {
   res.send('API working with /api/v1')
})
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/product', productRoutes)
app.use('/api/v1/order', orderRoutes)
app.use('/api/v1/payment', paymentRoutes)
app.use('/api/v1/dashboard', statsRoutes)

app.all('*', (req, res) => {
   res.status(404)
   if (req.accepts('json')) {
      res.json({ success: false, message: '404 not found!' })
   } else {
      res.type('txt').send('404 not found')
   }
})

app.use(errorMiddleware)

app.listen(PORT, () => {
   console.log(`Server listening on http://localhost:${PORT}`)
})
