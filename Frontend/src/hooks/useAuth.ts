import toast from "react-hot-toast"
import type { User } from "../types/users"
import { useApiClient } from "./useApiClient"
import { AuthContext } from "../contexts/AuthContext"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { useLocalizedPath } from "./useLocalizedPath"
import { useTranslation } from "react-i18next"

type LoginResult = "success" | "password_change_required" | "failure"

export function useAuth() {
    const { request } = useApiClient()
    const { t } = useTranslation('login')
    const authCtx = useContext(AuthContext)
    const navigate = useNavigate()
    const toLocalized = useLocalizedPath()

    async function login(email: string, password: string, newPassword?: string): Promise<LoginResult> {
        const response = await request<User>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password, newPassword })
        })

        // Special error : a password change is required
        if (!response.ok && response.code === 401 && response.json.error === "PASSWORD_CHANGE_REQUIRED") {
            return "password_change_required"
        }

        // Other error
        if (!response.ok) {
            toast.error(response.json.message)
            return "failure"
        }

        authCtx.login(response.json)
        toast.success(t('toasts.loginSuccessful', { name: response.json.first_name }))
        return "success"
    }

    async function logout(): Promise<void> {
        const response = await request<undefined>("/auth/logout", {
            method: "POST",
            credentials: "include"
        })

        if (!response.ok) {
            toast.error(response.json.message)
            return
        }

        authCtx.logout()
        toast.success(t('toasts.logoutSuccessful'))
        navigate(toLocalized("/login"))
    }

    return {
        login,
        logout
    }
}