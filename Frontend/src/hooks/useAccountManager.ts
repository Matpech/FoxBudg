import { useEffect, useState } from "react"
import type { User } from "../types/users"
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

    return {
        users,
        loadUsers
    }
}