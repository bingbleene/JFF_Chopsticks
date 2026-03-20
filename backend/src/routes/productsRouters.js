import express from "express"
import { createProduct, deleteProduct, getAllProducts, getProduct, updateProduct, getAllProductWithImport, getProductWithImport } from "../controllers/productsControllers.js"

const router = express.Router()

router.get("/", getAllProducts)

router.get("/with-import", getAllProductWithImport)

router.get("/:id/with-import", getProductWithImport)

router.get("/:id", getProduct)

router.post("/", createProduct)

router.put("/:id", updateProduct)

router.delete("/:id", deleteProduct)



export default router
