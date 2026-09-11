import { useEffect, useState } from "react"
import type { ExpenseReport, ExpenseReportSearchParams, ExpenseReportSearchResults } from "../types/reports"
import { useApiClient } from "./useApiClient"
import { useTranslation } from "react-i18next"
import toast from "react-hot-toast"

export function useReports() {
    const { request } = useApiClient()
    const { t } = useTranslation()

    const [results, setResults] = useState<ExpenseReport[] | null>(null)
    const [total, setTotal] = useState<number | null>(null)
    const [next, setNext] = useState(false)
    const [totalPages, setTotalPages] = useState<number | null>(null)
    const [searchParams, setSearchParams] = useState<ExpenseReportSearchParams>({ page: 1, status: [] })

    useEffect(() => {
        search()
    }, [searchParams])

    async function search() {
        setResults(null)
        setTotal(null)
        setNext(false)
        setTotalPages(null)

        const payload: ExpenseReportSearchParams = { page: searchParams.page}
        if (searchParams.status && searchParams.status.length > 0) {
            payload.status = searchParams.status
        }

        const response = await request<ExpenseReportSearchResults>("/reports/-/search", {
            method: "POST",
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            toast.error(t('reports.manager.errors.search'))
            return
        }

        setResults(response.json.results)
        setTotal(response.json.total)
        setNext(response.json.next)
        setTotalPages(response.json.pages)
    }

    return {
        results,
        total,
        next,
        totalPages,
        searchParams,

        setSearchParams,
        search
    }
}