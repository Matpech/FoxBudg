import { Wallet } from "lucide-react"
import { Link } from "react-router-dom"
import { useLocalizedPath } from "../../hooks/useLocalizedPath"
import { useContext } from "react"
import { AuthContext } from "../../contexts/AuthContext"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../hooks/useAuth"

function Navbar() {
    const { user } = useContext(AuthContext)
    const { t } = useTranslation()
    const toLocalized = useLocalizedPath()
    const { logout } = useAuth()

    return (
        <header className="
            flex justify-between items-center
            border-x-2 border-b-2 p-2 border-yellow-600
            bg-gray-50 dark:bg-zinc-900
            dark:text-white
        ">
            <div className="flex items-center gap-2">
                <Wallet size={64} color="var(--color-yellow-600)" />
                <div>
                    <Link to={toLocalized('/dashboard')}>
                        <h1 className="text-3xl font-bold">FoxBudg</h1>
                    </Link>
                    <p className="italic">{t('header.slogan')}</p>
                </div>
            </div>

            <nav className="flex gap-4 text-xl">
                <Link to={toLocalized(`/profile/${user?.id}`)}>{t('header.navigation.myProfile')}</Link>
                {user && ["accountant", "manager"].includes(user.role) && (
                    <Link to={toLocalized('/reports')}>{t('header.navigation.reportsPage')}</Link>
                )}
                {user && user.role === "manager" && (
                    <Link to={toLocalized('/admin')}>{t('header.navigation.adminPage')}</Link>
                )}
                <button
                    className="cursor-pointer"
                    onClick={async () => await logout()}
                >
                    {t('header.navigation.logout')}
                </button>
            </nav>
        </header>
    )
}

export default Navbar