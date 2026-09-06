import { ApiException, DatabaseException, NotFoundException } from "../types/errors";
import type { User } from "../types/users";
import { pool } from "../utils/db";

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