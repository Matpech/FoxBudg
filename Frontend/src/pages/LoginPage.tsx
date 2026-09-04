import { useState } from "react"
import { useTranslation } from "react-i18next"
import Card from "../components/ui/Card"
import { KeyRound } from "lucide-react"
import GenericButton from "../components/ui/GenericButton"

export function LoginPage() {
    const { t } = useTranslation('login')

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

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

                        <GenericButton
                            click={() => {}}
                        >
                            {t('submitButton')}
                        </GenericButton>
                        {/* <button
                            onClick={() => {}}
                            className="
                                bg-yellow-600 px-4 py-3
                                text-sm font-semibold text-white
                                shadow-sm transition
                                hover:bg-yellow-700
                                focus:outline-none focus:ring-2
                                focus:ring-yellow-500 focus:ring-offset-2
                                active:bg-yellow-800
                            "
                        >
                            {t('submitButton')}
                        </button> */}
                    </div>
                </Card>
            </section>
        </main>
    )
}