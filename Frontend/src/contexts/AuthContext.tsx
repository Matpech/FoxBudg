import { createContext, useState, type ReactNode } from "react";
import type { AuthenticatedUser } from "../types/users";

interface AuthContextType {
    user: AuthenticatedUser | null
    login: (
        userData: AuthenticatedUser
    ) => Promise<void>
    logout: () => Promise<void>
}

interface Props {
    children: ReactNode
}

export const AuthContext = createContext<AuthContextType>({ user: null, login: async (_userData) => {}, logout: async () => {} })

export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<AuthenticatedUser | null>(() => {
        const storedValue = localStorage.getItem("foxbudg_user")

        if (!storedValue) return null
        try {
            return JSON.parse(storedValue) as AuthenticatedUser
        } catch (error) {
            localStorage.removeItem("foxbudg_user")
            return null
        }
    })

    async function login(userData: AuthenticatedUser) {
        localStorage.setItem("foxbudg_user", JSON.stringify(userData))
    }

    async function logout() {
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}