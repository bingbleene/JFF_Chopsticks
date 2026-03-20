import express from 'express';
import { createTag, deleteTag, getAllTags, getTag, updateTag } from '../controllers/tagsControllers.js'

const router = express.Router()

router.get("/", getAllTags)

router.get("/:id", getTag)

router.post("/", createTag)

router.put("/:id", updateTag)

router.delete("/:id", deleteTag)

export default router