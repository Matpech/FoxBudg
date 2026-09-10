import { useTranslation } from "react-i18next";
import StatCard from "../components/ui/StatCard";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import type { UserStats } from "../types/users";
import toast from "react-hot-toast";
import { useApiClient } from "../hooks/useApiClient";
import { useSelfReports } from "../hooks/useSelfReports";
import ReportsTable from "../components/ReportsTable";
import DashboardNotificationBlock from "../components/DashboardNotificationBlock";

export function DashboardPage() {
    const { t } = useTranslation('dashboard')
    const { user } = useContext(AuthContext)
    const { request } = useApiClient()
    const { reports, load } = useSelfReports()

    const [stats, setStats] = useState<UserStats | null>(null)

    useEffect(() => {
        async function fetchDetails() {
            if (!user) {
                toast.error(t('toasts.errors.authctxNoUser'))
                return
            }
    
            const response = await request(`/users/${user.id}/stats`)
            if (!response.ok) {
                toast.error(response.json.message)
                return
            }

            setStats(response.json as UserStats)
        }

        fetchDetails()
    }, [])

    return (
        <main>
            {/* Message block if an accountant or manager has reports to process */}
            <DashboardNotificationBlock />

            {/* Statistics about expense reports of a user */}
            <section className="grid grid-cols-2 gap-4 md:flex md:gap-8 md:justify-center mt-8">
                <StatCard label={t('statistics.pending')} value={stats?.pending ?? "N/A"} />
                <StatCard label={t('statistics.approved')} value={stats?.approved ?? "N/A"} />
                <StatCard label={t('statistics.processed')} value={stats?.processed ?? "N/A"} />
                <StatCard label={t('statistics.totalAmount')} value={stats?.total_approved_amount ? stats.total_approved_amount + "€" : "N/A"} />
            </section>

            <ReportsTable reports={reports} reload={load} />
        </main>
    )
}