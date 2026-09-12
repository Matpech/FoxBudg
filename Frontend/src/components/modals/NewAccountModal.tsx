import { useTranslation } from "react-i18next"
import type { UserCreateParams, UserRole } from "../../types/users"
import { useMemo, useState } from "react"
import GenericButton from "../ui/GenericButton"

interface Props {
    submit: (details: UserCreateParams) => void
}

function NewAccountModal({ submit }: Props) {
    const { t } = useTranslation(['users', 'common'])

    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [role, setRole] = useState<UserRole>('employee')
    const [clicked, setClicked] = useState(false)

    const buttonDisabled = useMemo(() => {
        if (clicked) return true
        if (email.trim() === "") return true
        if (firstName.trim() === "") return true
        if (lastName.trim() === "") return true

        return false
    }, [email, firstName, lastName, role, clicked])

    return (
        <div className="flex flex-col gap-2 md:w-96">
            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                >
                    {t('userManager.newUser.modal.labels.email')}
                </label>

                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('userManager.newUser.modal.labels.email')}
                    className="
                        w-full border border-gray-300
                        bg-white px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:border-yellow-500
                        focus:ring-2 focus:ring-yellow-500/20
                    "
                />
            </div>

            <div>
                <label
                    htmlFor="first_name"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                >
                    {t('userManager.newUser.modal.labels.firstName')}
                </label>

                <input
                    id="first_name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('userManager.newUser.modal.labels.firstName')}
                    className="
                        w-full border border-gray-300
                        bg-white px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:border-yellow-500
                        focus:ring-2 focus:ring-yellow-500/20
                    "
                />
            </div>

            <div>
                <label
                    htmlFor="last_name"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                >
                    {t('userManager.newUser.modal.labels.lastName')}
                </label>

                <input
                    id="last_name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('userManager.newUser.modal.labels.lastName')}
                    className="
                        w-full border border-gray-300
                        bg-white px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:border-yellow-500
                        focus:ring-2 focus:ring-yellow-500/20
                    "
                />
            </div>

            <div>
                <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                >
                    {t('userManager.newUser.modal.labels.role')}
                </label>

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="
                        w-full border border-gray-300
                        bg-white px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:border-yellow-500
                        focus:ring-2 focus:ring-yellow-500/20
                    "
                >
                    {['employee', 'accountant', 'manager'].map((r) => (
                        <option value={r}>{t(`users.roles.${r}`, { ns: 'common' })}</option>
                    ))}
                </select>
            </div>

            <GenericButton
                disabled={buttonDisabled}
                click={() => {
                    setClicked(true)
                    submit({
                        email,
                        first_name: firstName,
                        last_name: lastName,
                        role
                    })
                }}
            >
                {t('userManager.newUser.modal.submit')}
            </GenericButton>
        </div>
    )
}

export default NewAccountModal