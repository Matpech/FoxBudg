import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useApiClient } from "../hooks/useApiClient"
import type { ExpenseReport, ExpenseReportStatus } from "../types/reports"
import MessageBlock from "./ui/MessageBlock"
import { useTranslation } from "react-i18next"

function DashboardNotificationBlock() {
    const { t } = useTranslation('dashboard')
    const { user } = useContext(AuthContext)
    const { request } = useApiClient()

    const [reportsToBeProcessed, setReportsToBeProcessed] = useState<number | null>(null)

    useEffect(() => {
        async function check(filter: ExpenseReportStatus) {
            const response = await request<{ total: number, results: ExpenseReport[], next: boolean }>('/reports/-/search', {
                method: "POST",
                body: JSON.stringify({ status: [filter] })
            })

            if (response.ok && response.json.total > 0) {
                setReportsToBeProcessed(response.json.total)
            }
        }

        if (user?.role === 'accountant') {
            // Accountants need to process approved reports
            check('approved')
        } else if (user?.role === 'manager') {
            // Managers need to process pending reports
            check('pending')
        } else {
            // Employees should not trigger this logic
            return
        }
    }, [])

    if (!reportsToBeProcessed) return

    return <MessageBlock type="info" title={t(`notification.title.${user?.role}`)} message={t(`notification.body.${user?.role}`, { x: reportsToBeProcessed })} />
}

export default DashboardNotificationBlock