import jwt from "jsonwebtoken"
import type { JwtData, LoginCredentials } from "../types/security";
import crypto from "crypto"
import { pool } from "./db";
import { ApiException, DatabaseException, InvalidSessionException } from "../types/errors";
import { compareSync, hashSync } from "bcrypt";

const JWT_LIFESPAN: string = process.env.JWT_LIFESPAN || "10m"

/**
 * Generate a new JWT containing user information, signed with the secret key from the environment
 * 
 * @param data The user information to encode inside the JWT
 * @returns A signed JWT that can be used for authentication
 */
export function signJwt(data: JwtData): string {
    return jwt.sign(data, process.env.JWT_SECRET as jwt.Secret, {
        algorithm: "HS256",
        expiresIn: JWT_LIFESPAN
    } as jwt.SignOptions)
}

/**
 * Generate and insert a random 64-character session ID into the database
 * 
 * @param userId The ID of the user that controls the session
 * @returns A 64-character session ID for the user
 * @throws DatabaseException
 */
export async function generateSessionId(userId: number): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString('hex')

    try {
        await pool.query(
            "INSERT INTO sessions (session_id, user_id) VALUES ($1, $2)",
            [sessionId, userId]
        )

        return sessionId
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Check if an email/password is valid.
 * 
 * @param credentials The login credentials to verify
 * @returns User information that can be used to generate a JWT
 * @throws ApiException or DatabaseException
 */
export async function checkLoginCredentials(credentials: LoginCredentials): Promise<JwtData> {
    try {
        const result = await pool.query(
            "SELECT id, first_name, last_name, email, role, password_hash FROM users WHERE email = $1",
            [credentials.email]
        )

        if (!result.rows[0]) {
            throw new ApiException(401, "INVALID_LOGIN_CREDENTIALS", "Email or password is incorrect")
        }

        if (compareSync(credentials.password, result.rows[0].password_hash)) {
            return {
                id: result.rows[0].id,
                email: result.rows[0].email,
                first_name: result.rows[0].first_name,
                last_name: result.rows[0].last_name,
                role: result.rows[0].role
            }
        } else {
            throw new ApiException(401, "INVALID_LOGIN_CREDENTIALS", "Email or password is incorrect")
        }
    } catch (error) {
        if (error instanceof ApiException) throw error

        throw new DatabaseException(error as Error)
    }
}

/**
 * Check if a session with the provided session ID exists in the database and is valid
 * 
 * @param sessionId The 64-character session ID to verify
 * @returns User information that can be used to generate a JWT
 * @throws InvalidSessionException or DatabaseException
 */
export async function checkSessionId(sessionId: string): Promise<JwtData> {
    try {
        const result = await pool.query(
            `
                SELECT
                    s.user_id AS id,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.role
                FROM active_sessions s
                INNER JOIN users u ON s.user_id = u.id
                WHERE s.id = $1 AND s.expires_at 
            `, [sessionId]
        )

        if (!result.rows[0]) {
            throw new InvalidSessionException()
        }

        return result.rows[0]
    } catch (error) {
        if (error instanceof ApiException) throw error

        throw new DatabaseException(error as Error)
    }
}

/**
 * Invalidate a specific session in the database
 * 
 * @param sessionId The ID of the session to invalidate
 * @throws DatabaseException
 */
export async function invalidateSessionId(sessionId: string): Promise<void> {
    try {
        await pool.query(
            "DELETE FROM sessions WHERE id = $1",
            [sessionId]
        )
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Update the password hash of a user in the database
 * 
 * @param userId The ID of the user that requested the password update
 * @param newPassword The new plaintext password to be hashed and inserted in the database
 */
export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = hashSync(newPassword, 12)
    
    try {
        await pool.query(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            [hashedPassword, userId]
        )
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}