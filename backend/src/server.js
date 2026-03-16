import express from 'express'
import productsRoute from './routes/productsRouters.js'
import salesProductsRoute from './routes/saleProductsRouters.js'
import vouchersRoute from './routes/vouchersRouters.js'
import invoicesRoute from './routes/invoicesRouters.js'
import { connectDB } from './config/db.js'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'

dotenv.config()

const PORT = process.env.PORT || 5001

const __dirname = path.resolve()

const app = express()

// middlewares
app.use(express.json())
if (process.env.NODE_ENV !== "production") {
  app.use(cors())
}

app.use("/api/products", productsRoute)
app.use("/api/sale-products", salesProductsRoute)
app.use("/api/vouchers", vouchersRoute)
app.use("/api/invoices", invoicesRoute)

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
