import { Router } from "express";
import validate from "../utils/validator/validator";
import { loginSchema, sessionIdValue } from "../utils/validator/schemas/authSchemas";
import { checkLoginCredentials, checkSessionId, generateSessionId, invalidateSessionId, needsToUpdatePassword, signJwt, updateUserPassword } from "../utils/auth";
import { ApiException, InvalidSessionException, ValidationException } from "../types/errors";

interface LoginPayload {
    email: string
    password: string
    newPassword?: string
}

const router = Router()

router.post('/login', async (req, res) => {
    // Verify email and password against the list of users
    const { email, password, newPassword } = validate<LoginPayload>(req, loginSchema)
    const userData = await checkLoginCredentials({ email, password })
    
    // Check if the user needs to update his password
    const passwordUpdateRequired = await needsToUpdatePassword(userData.id)
    if (passwordUpdateRequired) {
        if (!newPassword) {
            throw new ApiException(401, "PASSWORD_CHANGE_REQUIRED", "You need to update your password in order to log into your account")
        }

        if (password === newPassword) {
            throw new ApiException(400, "INVALID_NEW_PASSWORD", "Your new password cannot be identical to your old password")
        }

        await updateUserPassword(userData.id, newPassword)
    }
    
    // Return session ID and JWT to the user
    const sessionId = await generateSessionId(userData.id)
    const token = signJwt(userData)

    res.cookie("session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
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

router.post('/logout', async (req, res) => {
    const rawSessionId = req.cookies.session
    if (!rawSessionId) throw new ValidationException("No session ID found inside the request")

    const validationResult = sessionIdValue.validate(rawSessionId)
    if (validationResult.error || !validationResult.value) throw new InvalidSessionException()
    const sessionId = validationResult.value

    const userData = await checkSessionId(sessionId)
    if (userData.id !== req.user.id) {
        throw new ApiException(403, "SESSION_MISMATCH", "This session does not belong to you")
    } else {
        await invalidateSessionId(sessionId)
        res.clearCookie("jwt")
        res.clearCookie("session", { path: '/api/auth' })
        res.sendStatus(204)
    }
})

export default router