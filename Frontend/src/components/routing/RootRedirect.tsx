import { Navigate } from "react-router-dom"
import { DEFAULT_LANG, SUPPORTED_LANGS } from "../../i18n/config"

/**
 * When the user accesses the application without specifying a language, redirect to a specific language using browser preferences
 */
export default function RootRedirect() {
    const browserLanguage = navigator.language.slice(0, 2)
    const lang = SUPPORTED_LANGS.includes(browserLanguage) ? browserLanguage : DEFAULT_LANG
    return <Navigate to={`/${lang}`} replace />
}