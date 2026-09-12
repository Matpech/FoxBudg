import { useEffect, useState } from "react"
import type { User, UserRole } from "../types/users"
import { useApiClient } from "./useApiClient"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

export function useAccountManager() {
    const { t } = useTranslation('users')
    const { request } = useApiClient()

    const [users, setUsers] = useState<User[] | null>(null)

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        setUsers(null)

        const response = await request<User[]>("/users")
        if (!response.ok) {
            toast.error(t('errors.fetchUsers.default'))
            return
        }

        setUsers(response.json)
    }

    interface UserCreateParams {
        email: string
        first_name: string
        last_name: string
        role: UserRole
    }

    interface UserCreateResult {
        user: User
        password: string
    }

    async function createAccount(details: UserCreateParams): Promise<UserCreateResult> {
        const response = await request<UserCreateResult>("/users", {
            method: "POST",
            body: JSON.stringify(details)
        })

        if (!response.ok) {
            if (response.json.error === "EMAIL_ALREADY_TAKEN") throw new Error(t('userManager.errors.emailTaken'))
            else if (response.json.error === "VALIDATION_ERROR") throw new Error(t('userManager.errors.validationError'))
            else throw new Error(t('userManager.errors.createAccount'))
        }

        loadUsers()
        return response.json
    }

    async function deleteAccount(userId: number) {
        const response = await request(`/users/${userId}`, {
            method: "DELETE"
        })

        if (!response.ok) {
            if (response.json.error === "NOT_FOUND") throw new Error(t('errors.notFound'))
            else throw new Error(t('errors.deleteUser.default'))
        }

        loadUsers()
    }

    return {
        users,
        loadUsers,
        createAccount,
        deleteAccount
    }
}