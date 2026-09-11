import { useNavigate, useParams } from "react-router-dom"
import Card from "../components/ui/Card"
import UserIcon from "../components/ui/UserIcon"
import { useEffect, useState } from "react"
import type { User, UserStats } from "../types/users"
import { useApiClient } from "../hooks/useApiClient"
import toast from "react-hot-toast"
import { useLocalizedPath } from "../hooks/useLocalizedPath"
import { useTranslation } from "react-i18next"
import StatsDonut from "../components/StatsDonut"
import StatCard from "../components/ui/StatCard"
import { useWindowWidth } from "../hooks/useWindowWidth"

export function ProfilePage() {
    const { t } = useTranslation(['common', 'users'])
    const { user_id } = useParams()
    const { request } = useApiClient()
    const navigate = useNavigate()
    const toLocalized = useLocalizedPath()
    const width = useWindowWidth()

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
        <main className="flex flex-col gap-4">
            {/* User information */}
            {profile && (<section>
                <Card className="w-full flex gap-8 items-center">
                    <UserIcon size={width < 768 ? 'small' : 'large'} role={profile.role} />
                    
                    <div className="dark:text-white flex flex-col gap-3">
                        <h2 className="text-3xl md:text-5xl font-bold text-yellow-600">{profile.first_name} {profile.last_name.toUpperCase()}</h2>
                        <div>
                            <p className="md:text-lg">{t(`users.roles.${profile.role}`)}</p>
                            <p className="md:text-lg">{profile.email}</p>
                        </div>
                    </div>
                </Card>
            </section>)}

            {/* Account statistics */}
            {stats && (
                <section className="flex flex-col md:flex-row items-start gap-4">
                    <Card className="w-full md:w-80">
                        <div className="mb-4">
                            <h3 className="text-3xl font-bold text-yellow-600">{t('stats.chart.title', { ns: 'users' })}</h3>
                            <p className="dark:text-white wrap-break-word">{t('stats.chart.subtitle', { ns: 'users', name: profile?.first_name })}</p>
                        </div>
                        <div className="w-64 h-64 mx-auto">
                            <StatsDonut stats={stats} />
                        </div>
                    </Card>

                    <div className="w-full flex items-center mx-auto">
                        <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard className="w-full!" label={t('stats.cards.pending', { ns: 'users' })} value={stats.pending} />
                            <StatCard className="w-full!" label={t('stats.cards.approved', { ns: 'users' })} value={stats.approved} />
                            <StatCard className="w-full!" label={t('stats.cards.denied', { ns: 'users' })} value={stats.denied} />
                            <StatCard className="w-full!" label={t('stats.cards.processed', { ns: 'users' })} value={stats.processed} />
                            <StatCard className="w-full!" label={t('stats.cards.totalAmount', { ns: 'users' })} value={`${stats.total_amount}€`} />
                            <StatCard className="w-full!" label={t('stats.cards.totalApproved', { ns: 'users' })} value={`${stats.total_approved_amount}€`} />
                        </div>
                    </div>
                </section>
            )}
        </main>
    )
}