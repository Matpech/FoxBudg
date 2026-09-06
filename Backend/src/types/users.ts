/**
 * Valid roles for a user account
 */
export type UserRole = 'employee' | 'accountant' | 'manager'

export interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    role: UserRole
}