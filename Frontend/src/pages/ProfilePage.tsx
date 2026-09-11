import { useNavigate, useParams } from "react-router-dom"
import Card from "../components/ui/Card"
import UserIcon from "../components/ui/UserIcon"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import type { User, UserStats } from "../types/users"
import { useApiClient } from "../hooks/useApiClient"
import toast from "react-hot-toast"
import { useLocalizedPath } from "../hooks/useLocalizedPath"
import { useTranslation } from "react-i18next"

export function ProfilePage() {
    const { t } = useTranslation(['common', 'users'])
    const { user_id } = useParams()
    const { user } = useContext(AuthContext)
    const { request } = useApiClient()
    const navigate = useNavigate()
    const toLocalized = useLocalizedPath()

    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<User | null>(null)
    const [stats, setStats] = useState<UserStats | null>(null)

    async function fetchProfile(id: number) {
        const response = await request<User>(`/users/${id}`)

        if (!response.ok) {
            let errorMessageKey = 'errors.fetchProfile.default'
            if (response.json.error === 'NOT_FOUND') errorMessageKey = 'errors.notFound'
            throw new Error(t(errorMessageKey, { ns: 'users' }))
        }

        setProfile(response.json)
    }

    async function fetchStats(id: number) {
        const response = await request<UserStats>(`/users/${id}/stats`)

        if (!response.ok) {
            let errorMessageKey = 'errors.fetchStats.default'
            if (response.json.error === 'NOT_FOUND') errorMessageKey = 'errors.notFound'
            throw new Error(t(errorMessageKey, { ns: 'users' }))
        }

        setStats(response.json)
    }

    useEffect(() => {
        const id = Number(user_id)
        if (!Number.isSafeInteger(id) || id <= 0) {
            toast.error(t('errors.invalidId', { ns: 'users' }))
            navigate(toLocalized('/dashboard'))
            return
        }

        Promise.all([fetchProfile(id), fetchStats(id)]).then(() => {
            setLoading(false)
        }).catch((err: Error) => {
            toast.error(err.message)
            navigate(toLocalized('/dashboard'))
        })
    }, [user_id])

    if (loading) return (
        <main>
            <p className="text-white">Loading profile...</p>
        </main>
    )
    
    return (
        <main>
            {/* User information */}
            {profile && (<section>
                <Card className="w-full flex gap-8 items-center">
                    <UserIcon role={user?.role ?? 'employee'} />
                    
                    <div className="dark:text-white flex flex-col gap-3">
                        <p className="text-5xl font-bold text-yellow-600">{profile.first_name} {profile.last_name.toUpperCase()}</p>
                        <div>
                            <p className="text-lg">{t(`users.roles.${profile.role}`)}</p>
                            <p className="text-lg">{profile.email}</p>
                        </div>
                    </div>
                </Card>
            </section>)}

            {/* Account statistics */}
            <section>
                
            </section>
        </main>
    )
}