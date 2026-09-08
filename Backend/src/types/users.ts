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