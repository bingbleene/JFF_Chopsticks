import express from 'express'
import { createImport, deleteImport, getAllImports, getImport, updateImport, cancelImport, getImportForProduct } from '../controllers/importControllers.js'

const router = express.Router()

router.get("/", getAllImports)

router.get("/product/:productId", getImportForProduct)

router.get("/:id", getImport)

router.post("/", createImport)

router.put("/:id", updateImport)

router.put("/:id/cancel", cancelImport);

router.delete("/:id", deleteImport)

export default router