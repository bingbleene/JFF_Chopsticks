import express from "express"
import { createSaleProduct, deleteSaleProduct, getAllSaleProducts, getSaleProduct, updateSaleProduct } from "../controllers/saleProductsControllers.js"

const router = express.Router()

router.get("/", getAllSaleProducts)

router.get("/:id", getSaleProduct)

router.post("/", createSaleProduct)

router.put("/:id", updateSaleProduct)

router.delete("/:id", deleteSaleProduct)

export default router
