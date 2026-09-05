import { FileText, LogOut, User, UserCog, Wallet } from "lucide-react"
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
            flex justify-between items-center min-h-20
            md:border-x-2 border-b-2 p-2 border-yellow-600
            bg-gray-50 dark:bg-zinc-900
            dark:text-white
        ">
            <div className="flex items-center gap-2">
                <Wallet size={64} color="var(--color-yellow-600)" className="hidden md:block" />
                <div>
                    <Link to={toLocalized('/dashboard')}>
                        <h1 className="text-3xl font-bold">FoxBudg</h1>
                    </Link>
                    <p className="italic hidden md:block">{t('header.slogan')}</p>
                </div>
            </div>

            {/* Navigation links (icons on mobile, text on desktop) */}
            <nav className="flex gap-4 text-xl">
                {/* Link to user's profile */}
                <Link to={toLocalized(`/profile/${user?.id}`)}>
                    <span className="hidden md:block">{t('header.navigation.myProfile')}</span>
                    <User size={32} className="md:hidden" />
                </Link>
                
                {/* Link to expense reports manager (accessible by accountants and managers) */}
                {user && ["accountant", "manager"].includes(user.role) && (
                    <Link to={toLocalized('/reports')}>
                        <span className="hidden md:block">{t('header.navigation.reportsPage')}</span>
                        <FileText size={32} className="md:hidden" />
                    </Link>
                )}

                {/* Link to user management page (accessible by managers only) */}
                {user && user.role === "manager" && (
                    <Link to={toLocalized('/admin')}>
                        <span className="hidden md:block">{t('header.navigation.adminPage')}</span>
                        <UserCog size={32} className="md:hidden" />
                    </Link>
                )}

                {/* Logout button */}
                <button
                    className="cursor-pointer"
                    onClick={async () => await logout()}
                >
                    <span className="hidden md:block">{t('header.navigation.logout')}</span>
                    <LogOut size={32} className="md:hidden" />
                </button>
            </nav>
        </header>
    )
}

export default Navbar