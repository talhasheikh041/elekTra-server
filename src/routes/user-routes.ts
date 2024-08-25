import express from 'express'
import { allUsers, deleteUser, getUser, newUser, updateUser } from '../controllers/user-controllers.js'
import { adminOnly } from '../middlewares/auth.js'

const app = express.Router()

// route - /api/v1/user/new
app.post('/new', newUser)

// route - /api/v1/user/all
app.get('/all', adminOnly, allUsers)

// route - /api/v1/user/dynamicID
app.route('/:id').get(getUser).put(adminOnly, updateUser).delete(adminOnly, deleteUser)

// route - /api/v1/user/d

export default app
