import type { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken"
import { InvalidTokenException } from "../types/errors";
import type { JwtData } from "../types/security";

/**
 * JWT middleware
 * 
 * Extract the JWT from cookies (if defined) and verify if it is valid.
 * - If the cookie is not set, continue with req.user set to null
 * - If the cookie contains an invalid JWT, throw an error
 * - If the cookie contains a valid JWT, put the decoded user data inside of req.user and continue
 */
export const jwtMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Extract and verify the JWT
    const token = req.cookies.jwt
    if (token) {
        try {
            const decoded: unknown = jwt.verify(
                token,
                process.env.JWT_SECRET as jwt.Secret,
                { algorithms: ["HS256"] }
            )

            req.user = decoded as JwtData
            return next()
        } catch (error) {
            // Delete the JWT cookie if it is invalid
            // Not deleting the cookie will result in a refresh request failing due to the jwtMiddleware stopping it with the InvalidTokenException
            res.clearCookie("jwt")
            throw new InvalidTokenException()
        }
    } else {
        req.user = null
    }

    return next()
}