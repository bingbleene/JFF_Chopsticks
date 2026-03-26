import express from 'express'
import productsRoute from './routes/productsRouters.js'
import salesProductsRoute from './routes/saleProductsRouters.js'
import vouchersRoute from './routes/vouchersRouters.js'
import invoicesRoute from './routes/invoicesRouters.js'
import staffsRoute from './routes/staffsRouters.js'
import importRouters from './routes/importRouters.js'
import tagsRouters from './routes/tagsRouters.js'
import authRoute from './routes/authRoutes.js'
import userRoute from './routes/userRoutes.js'
import { connectDB } from './config/db.js'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import cookieParser from 'cookie-parser'
import { protectedRoute } from './middlewares/authMiddleware.js'

dotenv.config()

const PORT = process.env.PORT || 5001

const __dirname = path.resolve()

const app = express()

// middlewares
app.use(express.json())
if (process.env.NODE_ENV !== "production") {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }))
}

app.use(cookieParser())

// public API
app.use("/api/auth", authRoute)

// private API

app.use("/api/users", protectedRoute, userRoute)
app.use("/api/products", protectedRoute, productsRoute)
app.use("/api/sale-products", protectedRoute, salesProductsRoute)
app.use("/api/vouchers", protectedRoute, vouchersRoute)
app.use("/api/invoices", protectedRoute, invoicesRoute)
app.use("/api/staffs", protectedRoute, staffsRoute)
app.use("/api/imports", protectedRoute, importRouters)
app.use("/api/tags", protectedRoute, tagsRouters)

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
  })
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server bắt đầu trên cổng ${PORT}`)
  })
})
