import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "../../i18n/config";
import { useEffect } from "react";

export default function LangLayout() {
    const { lang } = useParams()
    const { i18n } = useTranslation()
    const isSupported = SUPPORTED_LANGS.includes(lang as string)

    useEffect(() => {
        if (isSupported && i18n.language !== lang) {
            i18n.changeLanguage(lang)
        }

        if (isSupported) {
            document.documentElement.lang = lang as string
        }
    }, [lang, isSupported, i18n])

    if (!isSupported) {
        const path = location.pathname.split('/').slice(2).join('/')
        return <Navigate to={`/${DEFAULT_LANG}/${path}`} replace />
    }
    
    return <Outlet />
}