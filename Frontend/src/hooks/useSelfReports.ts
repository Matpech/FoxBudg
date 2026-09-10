import { useEffect, useState } from "react";
import type { ExpenseReport } from "../types/reports";
import { useApiClient } from "./useApiClient";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function useSelfReports() {
    const { request } = useApiClient()
    const { t } = useTranslation('dashboard')

    const [reports, setReports] = useState<ExpenseReport[] | null>(null)

    // Fetch reports automatically
    useEffect(() => {
        load()
    }, [])

    async function load() {
        const response = await request<ExpenseReport[]>("/reports/self")

        if (!response.ok) {
            toast.error(t('toasts.errors.selfReportsFetchFailed'))
            setReports(null)
            return
        }

        setReports(response.json)
    }

    return {
        reports,
        load
    }
}