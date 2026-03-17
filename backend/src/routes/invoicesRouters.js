import express from "express"
import { createInvoice, deleteInvoice, getAllInvoices, getInvoice, updateInvoice, cancelInvoice } from "../controllers/invoicesControllers.js"

const router = express.Router()

router.get("/", getAllInvoices)

router.get("/:id", getInvoice)

router.post("/", createInvoice)

router.put("/:id", updateInvoice)

router.delete("/:id", deleteInvoice)

router.put("/:id/cancel", cancelInvoice);

export default router
