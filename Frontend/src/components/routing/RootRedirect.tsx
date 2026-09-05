import { Navigate } from "react-router-dom"
import { DEFAULT_LANG, SUPPORTED_LANGS } from "../../i18n/config"
import { useContext } from "react"
import { AuthContext } from "../../contexts/AuthContext"

/**
 * When the user accesses the application without specifying a language, redirect to a specific language using browser preferences
 */
export default function RootRedirect() {
    const browserLanguage = navigator.language.slice(0, 2)
    const lang = SUPPORTED_LANGS.includes(browserLanguage) ? browserLanguage : DEFAULT_LANG

    // Redirect the user depending on auth status
    // -> dashboard if authenticated
    // -> login page if not authenticated
    const authCtx = useContext(AuthContext)
    if (authCtx.user) {
        return <Navigate to={`/${lang}/dashboard`} replace />
    } else {
        return <Navigate to={`/${lang}/login`} replace />
    }
}