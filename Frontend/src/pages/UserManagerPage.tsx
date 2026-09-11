import { useContext, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { AuthContext } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useLocalizedPath } from "../hooks/useLocalizedPath"
import { useAccountManager } from "../hooks/useAccountManager"
import UsersTable from "../components/UsersTable"
import GenericButton from "../components/ui/GenericButton"

export function UserManagerPage() {
    const { t } = useTranslation(['users', 'common'])
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const toLocalized = useLocalizedPath()

    const accountManager = useAccountManager()

    useEffect(() => {
        if (user?.role !== 'manager') {
            navigate(toLocalized('/dashboard'))
        }
    }, [user])

    return (
        <main>
            <div className="mb-8 md:flex md:items-center md:justify-between">
                <div className="not-md:mb-4">
                    <h2 className="text-3xl font-bold text-yellow-600">{t('userManager.title')}</h2>
                    <p className="italic dark:text-white">{t('userManager.subtitle')}</p>
                </div>

                {/* TODO: Add a modal to create a user */}
                <GenericButton
                    click={() => {}}
                >
                    {t('userManager.newUser')}
                </GenericButton>
            </div>

            <UsersTable users={accountManager.users} />
        </main>
    )
}