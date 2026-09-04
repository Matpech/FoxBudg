import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import Card from "../components/ui/Card"
import { KeyRound } from "lucide-react"
import GenericButton from "../components/ui/GenericButton"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { useLocalizedPath } from "../hooks/useLocalizedPath"
import ErrorBlock from "../components/ui/ErrorBlock"

export function LoginPage() {
    const { t } = useTranslation('login')
    const auth = useAuth()
    const navigate = useNavigate()
    const toLocalized = useLocalizedPath()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [buttonDisabledOverride, setButtonDisabledOverride] = useState(false)

    const [updateMode, setUpdateMode] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [newPasswordConf, setNewPasswordConf] = useState("")

    const buttonDisabled = useMemo(() => {
        if (buttonDisabledOverride) return true

        if (email.trim() === "") return true
        if (password.trim().length < 8) return true

        if (updateMode) {
            if (newPassword.trim().length < 8) return true
            if (newPassword.trim() !== newPasswordConf.trim()) return true
        }

        return false
    }, [buttonDisabledOverride, email, password, updateMode, newPassword, newPasswordConf])

    async function handleLogin() {
        setButtonDisabledOverride(true)

        const result = await auth.login(email, password, (updateMode ? newPassword : undefined))
        if (result === "success") {
            navigate(toLocalized("/dashboard"))
            return
        }

        if (result === "password_change_required") {
            setUpdateMode(true)
        }

        // Reactivate button after 2s
        setTimeout(() => setButtonDisabledOverride(false), 2000)
    }

    return (
        <main className="min-h-screen bg-linear-to-t from-yellow-600/60 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center px-4">
            <section className="w-full max-w-md">
                <Card>
                    {/* Header */}
                    <div className="mb-8 flex gap-4">
                        <KeyRound size={64} color="var(--color-yellow-600)" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                {t('title')}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-200">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {updateMode && (<ErrorBlock title={t('passwordUpdate.title')} message={t('passwordUpdate.message')} />)}
                        
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                            >
                                {t('labels.email')}
                            </label>

                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('placeholders.email')}
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
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                            >
                                {t('labels.password')}
                            </label>

                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('placeholders.password')}
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

                        {updateMode && (
                            <>
                                <div>
                                    <label
                                        htmlFor="new-password"
                                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                                    >
                                        {t('labels.newPassword')}
                                    </label>

                                    <input
                                        id="new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={t('placeholders.password')}
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
                                        htmlFor="new-password-confirm"
                                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                                    >
                                        {t('labels.confirmNewPassword')}
                                    </label>

                                    <input
                                        id="new-password-confirm"
                                        type="password"
                                        autoComplete="new-password"
                                        value={newPasswordConf}
                                        onChange={(e) => setNewPasswordConf(e.target.value)}
                                        placeholder={t('placeholders.password')}
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
                            </>
                        )}

                        <GenericButton
                            click={handleLogin}
                            disabled={buttonDisabled}
                        >
                            {t('submitButton')}
                        </GenericButton>
                    </div>
                </Card>
            </section>
        </main>
    )
}