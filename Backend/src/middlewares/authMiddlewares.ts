import type { NextFunction, Request, Response } from "express";
import { ApiException } from "../types/errors";
import type { UserRole } from "../types/users";

/**
 * Throws a 403 ApiException if the user is authenticated.
 * 
 * Use this middleware for endpoints that should not be used while authenticated (for example: register or login)
 */
export const unauthenticated = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (req.user) {
        throw new ApiException(403, "AUTHENTICATED", "You must be logged out to perform this operation")
    } else {
        return next()
    }
}

/**
 * Throws a 401 ApiException if the user is not authenticated to ask them to log in.
 * 
 * Use this middleware for endpoints that require authentication.
 */
export const authenticated = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        throw new ApiException(401, "UNAUTHENTICATED", "You must be logged in to perform this operation")
    } else {
        next()
        return true
    }
}

/**
 * Creates a middleware that requires a specific role from the user.
 * 
 * This function generates the middleware, **it is not the middleware**. Therefore, it should be called with parentheses as such :
 * ```
 * router.post('/foo', roleRequired('accountant', 'manager'), async (req, res) => {
 *     // ...
 * })
 * ```
 * 
 * And not like the other middlewares :
 * ```
 * router.post('/bar', authenticated, async (req, res) => {
 *     // ...
 * })
 * ```
 * 
 * Notes:
 * - This middleware automatically applies the same logic as the `authenticated` middleware, which is therefore not required.
 * - The middleware **does not guarantee** the user role from the JWT is synced with the database. A second verification in the database should be done when performing sensitive operations.
 * 
 * @param authorizedRoles The list of roles that are allowed to use the endpoint. If the user is not authenticated or does not have one of these roles, they will be rejected.
 * @returns The custom middleware built for the allowed roles
 */
export const roleRequired: (...authorizedRoles: UserRole[]) => ((req: Request, _res: Response, next: NextFunction) => void) = (
    ...authorizedRoles: UserRole[]
) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        // The user is not logged in
        if (!req.user) throw new ApiException(401, "UNAUTHENTICATED", "You must be logged in to perform this operation")
        
        // The user does not have permission
        if (!authorizedRoles.includes(req.user.role)) throw new ApiException(403, "ACCESS_DENIED", "You do not have the role required to perform this operation")

        // The user is authenticated and seemingly has permission. Proceed.
        next()
    }
}