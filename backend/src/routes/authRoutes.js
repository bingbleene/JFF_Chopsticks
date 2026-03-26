import express from 'express'
import { signIn, signOut, signUp } from '../controllers/authControllers.js'

const router = express.Router();

router.post("/sign-up", signUp);

router.post("/sign-in", signIn);

router.post("/sign-out", signOut);

export default router