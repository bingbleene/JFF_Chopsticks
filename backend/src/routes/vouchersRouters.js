import express from "express"
import { createVoucher, deleteVoucher, getAllVouchers, getVoucher, updateVoucher } from "../controllers/vouchersControllers.js"

const router = express.Router()

router.get("/", getAllVouchers)

router.get("/:id", getVoucher)

router.post("/", createVoucher)

router.put("/:id", updateVoucher)

router.delete("/:id", deleteVoucher)

export default router
