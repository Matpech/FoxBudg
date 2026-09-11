import { hashSync } from "bcrypt";
import { ApiException, DatabaseException, NotFoundException } from "../types/errors";
import type { User, UserCreateParams, UserUpdateParams } from "../types/users";
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

/**
 * Get a list of all users of the application for use in the users management dashboard
 * 
 * @returns An array of user account details
 * @throws DatabaseException
 */
export async function getUsers(): Promise<User[]> {
    try {
        const result = await pool.query<User>(
            "SELECT id, email, first_name, last_name, role FROM users"
        )

        return result.rows
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Update a specific user of the application.
 * 
 * Note: a manager cannot update his own role, as this could create an illegal state of the application where there would be no managers.
 * 
 * @param userId The ID of the user to update
 * @param newDetails An object containing all the details to update for the specified user
 * @param updatingSelf Boolean flag used to detect if a manager is updating their own account
 * @returns The updated User object
 * @throws ApiException, NotFoundException or DatabaseException
 */
export async function updateUser(userId: number, newDetails: UserUpdateParams, updatingSelf: boolean): Promise<User> {
    const fields = []
    const values: any[] = [userId]
    let index = 2

    if (newDetails.first_name) {
        fields.push(`first_name = $${index++}`)
        values.push(newDetails.first_name)
    }

    if (newDetails.last_name) {
        fields.push(`last_name = $${index++}`)
        values.push(newDetails.last_name)
    }

    if (newDetails.role) {
        // Stop if a manager tries to update their own role
        // This would prevent softlocking the application by having no managers
        if (updatingSelf) throw new ApiException(403, "ILLEGAL_UPDATE", "For security reasons, you cannot update your own role")

        fields.push(`role = $${index++}`)
        values.push(newDetails.role)
    }

    // Don't perform a request if there is nothing to update
    if (fields.length === 0) throw new ApiException(400, "NOTHING_TO_UPDATE", "There are no fields to update")

    const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $1
        RETURNING id, email, first_name, last_name, role
    `

    // Execute the update request
    try {
        const result = await pool.query<User>(query, values)
        if (!result.rows[0]) throw new NotFoundException("User")
        return result.rows[0]
    } catch (error) {
        if (error instanceof ApiException) throw error
        throw new DatabaseException(error as Error)
    }
}

/**
 * Delete a user account from the application.
 * 
 * This operation will delete all active sessions tied to the user (ON DELETE CASCADE).
 * It will also mark all expense reports from the user with user = NULL (ON DELETE SET NULL).
 * 
 * TODO: Automatically deny all pending expenses requests from the user
 * 
 * @param userId The ID of the user to delete
 * @throws NotFoundException or DatabaseException
 */
export async function deleteUser(userId: number): Promise<void> {
    try {
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1",
            [userId]
        )

        if (result.rowCount === 0) throw new NotFoundException("User")
    } catch (error) {
        if (error instanceof ApiException) throw error
        throw new DatabaseException(error as Error)
    }
}

interface UserReportStats {
    total: number
    pending: number
    approved: number
    denied: number
    processed: number
    total_approved_amount: number
}

/**
 * Get expense report statistics from a specific user. These statistics include :
 * - The total number of expense reports submitted by the user
 * - The number of reports by status (pending, approved, denied, processed)
 * - The total amount of all expenses approved by management
 * 
 * @param userId The ID of the user
 * @returns An object with all expense report stats
 * @throws NotFoundException or DatabaseException
 */
export async function getUserReportStats(userId: number): Promise<UserReportStats> {
    try {
        const result = await pool.query<UserReportStats>(
            `
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM expense_reports
                        WHERE user_id = $1
                    )::integer AS total,
                    (
                        SELECT COUNT(*)
                        FROM expense_reports
                        WHERE user_id = $1
                        AND status = 'pending'
                    )::integer AS pending,
                    (
                        SELECT COUNT(*)
                        FROM expense_reports
                        WHERE user_id = $1
                        AND status = 'approved'
                    )::integer AS approved,
                    (
                        SELECT COUNT(*)
                        FROM expense_reports
                        WHERE user_id = $1
                        AND status = 'denied'
                    )::integer AS denied,
                    (
                        SELECT COUNT(*)
                        FROM expense_reports
                        WHERE user_id = $1
                        AND status = 'processed'
                    )::integer AS processed,
                    (
                        SELECT COALESCE(SUM(amount), 0)
                        FROM expense_reports
                        WHERE user_id = $1
                        AND status IN ('approved', 'processed')
                    ) AS total_approved_amount
                FROM users
                WHERE id = $1
            `, [userId]
        )

        if (!result.rows[0]) throw new NotFoundException("User")
        return result.rows[0]
    } catch (error) {
        if (error instanceof ApiException) throw error
        throw new DatabaseException(error as Error)
    }
}