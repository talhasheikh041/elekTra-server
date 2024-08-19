import multer from 'multer'
// import path from 'path'
// import fs from 'fs'
// import { v4 as uuid } from 'uuid'

// const uploadDir = path.join(import.meta.dirname, '..', 'uploads')
// if (!fs.existsSync(uploadDir)) {
//    fs.mkdirSync(uploadDir)
// }

// const storage = multer.diskStorage({
//    destination(req, file, callback) {
//       callback(null, uploadDir)
//    },
//    filename(req, file, callback) {
//       const id = uuid()
//       const ext = file.originalname.split('.').pop()
//       callback(null, `${id}.${ext}`)
//    },
// })

export const singleUpload = multer().single('photo')
export const multiUpload = multer().array('photos', 6)
