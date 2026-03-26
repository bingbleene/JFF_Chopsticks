import express from 'express'
import { refreshToken, signIn, signOut, signUp } from '../controllers/authControllers.js'

const router = express.Router();

router.post("/sign-up", signUp);

router.post("/sign-in", signIn);

router.post("/sign-out", signOut);

router.post("/refresh-token", refreshToken);

export default router