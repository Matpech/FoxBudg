import { Router } from "express";
import validate from "../utils/validator/validator";
import { loginSchema, sessionIdValue } from "../utils/validator/schemas/authSchemas";
import type { LoginCredentials } from "../types/security";
import { checkLoginCredentials, checkSessionId, generateSessionId, signJwt } from "../utils/auth";
import { InvalidSessionException, ValidationException } from "../types/errors";

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
        path: '/'
    })

    res.sendStatus(204)
})

router.post('/refresh', async (req, res) => {
    const rawSessionId = req.cookies.session
    if (!rawSessionId) throw new ValidationException("No session ID found inside the request")

    const validationResult = sessionIdValue.validate(rawSessionId)
    if (validationResult.error || !validationResult.value) throw new InvalidSessionException()
    const sessionId = validationResult.value

    const userData = await checkSessionId(sessionId)
    const token = signJwt(userData)

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    })

    res.sendStatus(204)
})

export default router