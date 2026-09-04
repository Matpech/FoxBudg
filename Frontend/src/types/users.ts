export type UserRole = 'employee' | 'accountant' | 'manager'

export interface AuthenticatedUser {
    id: number
    email: string
    first_name: string
    last_name: string
    role: UserRole
}