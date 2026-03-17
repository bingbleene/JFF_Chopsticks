import express from 'express'
import { createStaff, deleteStaff, getAllStaff, getStaff, updateStaff } from '../controllers/staffControllers.js'

const router = express.Router()

router.get('/', getAllStaff)

router.get('/:id', getStaff)

router.post('/', createStaff)

router.put('/:id', updateStaff)

router.delete('/:id', deleteStaff)

export default router