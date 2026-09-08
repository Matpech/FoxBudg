import { hashSync } from "bcrypt";
import { ApiException, DatabaseException, NotFoundException } from "../types/errors";
import type { User, UserCreateParams } from "../types/users";
import { generateRandomPassword } from "../utils/auth";
import { pool } from "../utils/db";

/**
 * Fetch a single user by ID from the database.
 * 
 * @param userId The ID of the user to fetch
 * @returns The user data associated to the user ID
 * @throws NotFoundException or DatabaseException
 */
export async function getOneUser(userId: number): Promise<User> {
    try {
        const result = await pool.query<User>(
            "SELECT id, email, first_name, last_name, role FROM users WHERE id = $1",
            [userId]
        )

        if (!result.rows[0]) {
            throw new NotFoundException("User")
        }

        return result.rows[0]
    } catch (error) {
        if (error instanceof ApiException) throw error
        throw new DatabaseException(error as Error)
    }
}

interface UserCreateResult {
    user: User
    password: string
}

/**
 * Create a new user account in the database with a randomly generated password.
 * 
 * The current version of the account creation process sends the one time password back to the manager.
 * The manager who creates the account is expected to send that password to the person.
 * 
 * There is no email sending logic in the backend currently, this is therefore the only way to handle account creation.
 * 
 * @param details The details of the user to create (email, full name and account role)
 * @returns The full user details and the password that can be used to log into the new account
 * @throws ApiException or DatabaseException
 */
export async function createUserAccount(details: UserCreateParams): Promise<UserCreateResult> {
    const randomPassword = generateRandomPassword()
    const hash = hashSync(randomPassword, 12)

    try {
        const result = await pool.query<User>(
            "INSERT INTO users (email, first_name, last_name, role, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role",
            [details.email, details.first_name, details.last_name, details.role, hash]
        )

        if (!result.rows[0]) {
            throw new DatabaseException(new Error("Failed to create user account"))
        }

        return {
            user: result.rows[0],
            password: randomPassword
        }
    } catch (error) {
        if (error instanceof ApiException) throw error
        if (error instanceof Error && "code" in error && "constraint" in error) {
            if (error.code === "23505") {
                throw new ApiException(409, "EMAIL_ALREADY_TAKEN", "This email is already associated with an existing account")
            }
        }
        throw new DatabaseException(error as Error)
    }
}