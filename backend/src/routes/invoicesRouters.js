import express from "express"
import { createInvoice, deleteInvoice, getAllInvoices, getInvoice, updateInvoice } from "../controllers/invoicesControllers.js"

const router = express.Router()

router.get("/", getAllInvoices)

router.get("/:id", getInvoice)

router.post("/", createInvoice)

router.put("/:id", updateInvoice)

router.delete("/:id", deleteInvoice)

export default router
