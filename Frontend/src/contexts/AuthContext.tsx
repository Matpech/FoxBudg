import { createContext, useState, type ReactNode } from "react";
import type { User } from "../types/users";

interface AuthContextType {
    user: User | null
    login: (
        userData: User
    ) => void
    logout: () => void
}

interface Props {
    children: ReactNode
}

export const AuthContext = createContext<AuthContextType>({ user: null, login: async (_userData) => {}, logout: async () => {} })

export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<User | null>(() => {
        const storedValue = localStorage.getItem("foxbudg_user")

        if (!storedValue) return null
        try {
            return JSON.parse(storedValue) as User
        } catch (error) {
            localStorage.removeItem("foxbudg_user")
            return null
        }
    })

    function login(userData: User) {
        setUser(userData)
        localStorage.setItem("foxbudg_user", JSON.stringify(userData))
    }

    function logout() {
        localStorage.removeItem("foxbudg_user")
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