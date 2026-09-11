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

    async function createAccount(details: UserCreateParams) {
        const response = await request<{ user: User, password: string }>("/users", {
            method: "POST",
            body: JSON.stringify(details)
        })

        if (!response.ok) {
            if (response.json.error === "EMAIL_ALREADY_TAKEN") throw new Error(t('userManager.errors.emailTaken'))
            else if (response.json.error === "VALIDATION_ERROR") throw new Error(t('userManager.errors.validationError'))
            else throw new Error(t('userManager.errors.createAccount'))
        }

        loadUsers()
    }

    return {
        users,
        loadUsers,
        createAccount
    }
}