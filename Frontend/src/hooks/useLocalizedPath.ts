import { useParams } from "react-router-dom";

export function useLocalizedPath() {
    const { lang } = useParams()
    return (path: string) => `/${lang}${path}`
}