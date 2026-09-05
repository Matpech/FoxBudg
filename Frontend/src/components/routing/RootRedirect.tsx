import { Navigate, useParams } from "react-router-dom"
import { DEFAULT_LANG, SUPPORTED_LANGS } from "../../i18n/config"
import { useContext } from "react"
import { AuthContext } from "../../contexts/AuthContext"

/**
 * When the user accesses the application without specifying a language, redirect to a specific language using browser preferences.
 * 
 * This component can also get triggered if the user requests /:lang without anything after.
 * Therefore, we check if the lang parameter exists before using the browser language
 */
export default function RootRedirect() {
    const params = useParams()
    let lang = DEFAULT_LANG
    if (params.lang) {
        lang = params.lang
    } else {
        const browserLanguage = navigator.language.slice(0, 2)
        lang = SUPPORTED_LANGS.includes(browserLanguage) ? browserLanguage : DEFAULT_LANG
    }


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