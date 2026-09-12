import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { AuthContext } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useLocalizedPath } from "../hooks/useLocalizedPath"
import { useAccountManager } from "../hooks/useAccountManager"
import UsersTable from "../components/UsersTable"
import GenericButton from "../components/ui/GenericButton"
import { createPortal } from "react-dom"
import Modal from "../components/ui/Modal"
import NewAccountModal from "../components/modals/NewAccountModal"
import type { User, UserCreateParams } from "../types/users"
import toast from "react-hot-toast"
import RegistrationSuccessModal from "../components/modals/RegistrationSuccessModal"
import ConfirmationPrompt from "../components/modals/ConfirmationModal"

export function UserManagerPage() {
    const { t } = useTranslation(['users', 'common'])
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const toLocalized = useLocalizedPath()

    const accountManager = useAccountManager()

    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [createSuccessModalOpen, setCreateSuccessModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    const [password, setPassword] = useState("")

    useEffect(() => {
        if (user?.role !== 'manager') {
            navigate(toLocalized('/dashboard'))
        }
    }, [user])

    async function handleUserCreation(details: UserCreateParams) {
        try {
            const result = await accountManager.createAccount(details)
            toast.success(t('userManager.newUser.successToast'))

            // Show the post registration modal to ask the manager to copy the password
            setPassword(result.password)
            setCreateSuccessModalOpen(true)
        } catch (error) {
            if (error instanceof Error) toast.error(error.message)
            else toast.error(t('userManager.errors.createAccount'))
        }

        setCreateModalOpen(false)
    }

    async function handleUserDeletion(user: User) {
        await accountManager.deleteAccount(user.id)
        toast.success(t('userManager.deleteUser.successToast'))
        setUserToDelete(null)
    }

    return (
        <main>
            <div className="mb-8 md:flex md:items-center md:justify-between">
                <div className="not-md:mb-4">
                    <h2 className="text-3xl font-bold text-yellow-600">{t('userManager.title')}</h2>
                    <p className="italic dark:text-white">{t('userManager.subtitle')}</p>
                </div>

                <GenericButton
                    click={() => setCreateModalOpen(true)}
                >
                    {t('userManager.newUser.create')}
                </GenericButton>

                {createModalOpen && createPortal(
                    <Modal title={t('userManager.newUser.create')} onClose={() => setCreateModalOpen(false)} >
                        <NewAccountModal submit={(details) => handleUserCreation(details)} />
                    </Modal>, document.body
                )}

                {createSuccessModalOpen && createPortal(
                    <Modal title={t('userManager.newUser.postRegister.title')}>
                        <RegistrationSuccessModal
                            password={password}
                            onAcknowledge={() => setCreateSuccessModalOpen(false)}
                        />
                    </Modal>, document.body
                )}
            </div>

            <UsersTable users={accountManager.users} onDelete={(user) => setUserToDelete(user)} />

            {userToDelete && createPortal(
                <Modal title={t('userManager.deleteUser.title')} onClose={() => setUserToDelete(null)}>
                    <ConfirmationPrompt
                        message={t('userManager.deleteUser.message', { fullname: `${userToDelete.first_name} ${userToDelete.last_name.toUpperCase()}` })}
                        onCancel={() => setUserToDelete(null)}
                        onConfirm={() => userToDelete && handleUserDeletion(userToDelete)}
                    />
                </Modal>, document.body
            )}
        </main>
    )
}