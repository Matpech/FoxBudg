import { Router } from "express";
import validate from "../utils/validator/validator";
import { loginSchema } from "../utils/validator/schemas/authSchemas";
import type { LoginCredentials } from "../types/security";
import { checkLoginCredentials, generateSessionId, signJwt } from "../utils/auth";

const router = Router()

router.post('/login', async (req, res) => {
    const credentials = validate<LoginCredentials>(req, loginSchema)
    const userData = await checkLoginCredentials(credentials)
    const sessionId = await generateSessionId(userData.id)
    const token = signJwt(userData)

    res.cookie("session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth/refresh',
        maxAge: 30 * 24 * 60 * 60 * 1000
    })

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000
    })

    res.sendStatus(204)
})

export default router