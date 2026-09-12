export type UserRole = 'employee' | 'accountant' | 'manager'

export interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    role: UserRole
}

export interface UserStats {
    total: number
    pending: number
    approved: number
    denied: number
    processed: number
    total_amount: number
    total_approved_amount: number
}

export type UserCreateParams = Omit<User, 'id'>