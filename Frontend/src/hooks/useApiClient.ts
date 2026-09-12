import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useLocalizedPath } from "./useLocalizedPath"

export interface ApiSuccess<T> {
    ok: true
    code: number
    json: T
}

export interface ApiFailure {
    ok: false
    code: number
    json: {
        error: string
        message: string
    }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

const BASE_URL = "/api"

// Use a refresh lock to prevent spamming the refresh endpoint in the case of concurrent requests failing
let refreshPromise: Promise<boolean> | null = null

export function useApiClient() {
    const authCtx = useContext(AuthContext)
    const navigate = useNavigate()
    const toLocalized = useLocalizedPath()

    async function refreshJWT(): Promise<boolean> {
        try {
            const response = await fetch(`${BASE_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include"
            })

            if (response.ok) {
                return true
            }

            return false
        } catch (_error) {
            return false
        }
    }

    async function tryRefreshJWT(): Promise<boolean> {
        // Don't initiate a refresh request if one is already running
        if (refreshPromise) return refreshPromise

        // Acquire refresh lock
        refreshPromise = refreshJWT()

        try {
            const success = await refreshPromise

            if (!success) {
                authCtx.logout()
                navigate(toLocalized("/login"))
            }

            return success
        } finally {
            // Release refresh lock
            refreshPromise = null
        }
    }

    async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = `${BASE_URL}${endpoint}`
        const headers: any = {...options.headers}

        if (options.body && !(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json"
        }

        let response = await fetch(url, {
            ...options,
            headers,
            credentials: "include"
        })

        let contentType = response.headers.get("Content-Type")
        let json = contentType?.split(";")[0].trim() === "application/json"
            ? await response.json()
            : undefined
        
        /**
         * Check for errors related to JWT authentication.
         * These errors always use the 401 HTTP response code.
         * 
         * There are 2 scenarios that should trigger a JWT refresh :
         * - "INVALID_TOKEN" error code (JWT has expired)
         * - "UNAUTHENTICATED" error code with user data stored in localStorage (the cookie no longer exists)
         */
        if (
            response.status === 401 && (
                json.error === "INVALID_TOKEN"
                || (json.error === "UNAUTHENTICATED" && authCtx.user)
            )

        ) {
            const refreshed = await tryRefreshJWT()
            if (refreshed) {
                response = await fetch(url, {
                    ...options,
                    headers,
                    credentials: "include"
                })

                contentType = response.headers.get("Content-Type")
                if (contentType?.split(";")[0].trim() === "application/json") {
                    json = await response.json()
                }
            } else {
                return { ok: false, code: 401, json } as ApiFailure
            }
        }

        return { ok: response.ok, code: response.status, json }
    }

    return {
        request
    }
}