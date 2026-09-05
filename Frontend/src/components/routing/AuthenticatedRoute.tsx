import { Navigate } from "react-router-dom"
import { useContext, type ReactNode } from "react"
import { AuthContext } from "../../contexts/AuthContext"
import { useLocalizedPath } from "../../hooks/useLocalizedPath"

interface Props {
    children: ReactNode
}

function AuthenticatedRoute({ children }: Props) {
    const authCtx = useContext(AuthContext)
    const toLocalized = useLocalizedPath()

    if (!authCtx.user) {
        return <Navigate to={toLocalized('/login')} replace />
    }

    return children
}

export default AuthenticatedRoute