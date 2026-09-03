import type { UserRole } from "./users"

/**
 * User information stored inside of the JWT
 */
export interface JwtData {
    id: number
    email: string
    first_name: string
    last_name: string
    role: UserRole
}

/**
 * Email/password combination used for logging in to the application
 */
export interface LoginCredentials {
    email: string
    password: string
}