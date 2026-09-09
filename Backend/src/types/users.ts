/**
 * Valid roles for a user account
 */
export type UserRole = 'employee' | 'accountant' | 'manager'

/**
 * Public/non sensitive user information that can be returned by the database
 */
export interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    role: UserRole
}

/**
 * Information used to create a new account in the user management panel
 */
export interface UserCreateParams {
    email: string
    first_name: string
    last_name: string
    role: UserRole
}

/**
 * Information about a user that can be updated by a manager
 */
export interface UserUpdateParams {
    first_name?: string
    last_name?: string
    role?: UserRole
}