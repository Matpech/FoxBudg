import { useTranslation } from "react-i18next"
import AdvancedReportsTable from "../components/AdvancedReportsTable"
import { useReports } from "../hooks/useReports"
import GenericButton from "../components/ui/GenericButton"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useLocalizedPath } from "../hooks/useLocalizedPath"

export function ReportsManagerPage() {
    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const toLocalized = useLocalizedPath()

    // Deny access to employees (only allow accountants and managers)
    useEffect(() => {
        if (!user || !['accountant', 'manager'].includes(user?.role)) {
            navigate(toLocalized('/dashboard'))
        }
    }, [user])
    
    const reports = useReports()

    return (
        <main>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-yellow-600">{t('reports.manager.pageName')}</h2>
                <p className="italic dark:text-white">{t('reports.manager.pageDescription')}</p>
            </div>

            <AdvancedReportsTable reports={reports.results} updateData={reports.search} />

            <div className={`mt-2 flex gap-1 justify-center items-center ${!reports.results && 'hidden'}`}>
                <GenericButton
                    click={() => reports.setSearchParams((prev) => ({
                        ...prev,
                        page: 1
                    }))}
                    disabled={reports.searchParams.page <= 1}
                >
                    <div className="flex items-center gap-2">
                        <ChevronsLeft />
                        <span className="not-md:hidden">{t('components.pagination.first')}</span>
                    </div>
                </GenericButton>

                <GenericButton
                    click={() => reports.setSearchParams((prev) => ({
                        ...prev,
                        page: prev.page - 1
                    }))}
                    disabled={reports.searchParams.page <= 1}
                >
                    <div className="flex items-center gap-2">
                        <ChevronLeft />
                        <span className="not-md:hidden">{t('components.pagination.previous')}</span>
                    </div>
                </GenericButton>

                <p className="px-4 text:lg md:text-xl dark:text-white">Page {reports.searchParams.page}/{reports.totalPages}</p>

                <GenericButton
                    click={() => reports.setSearchParams((prev) => ({
                        ...prev,
                        page: prev.page + 1
                    }))}
                    disabled={!reports.totalPages || reports.searchParams.page >= reports.totalPages}
                >
                    <div className="flex items-center gap-2">
                        <span className="not-md:hidden">{t('components.pagination.next')}</span>
                        <ChevronRight />
                    </div>
                </GenericButton>

                <GenericButton
                    click={() => reports.totalPages && reports.setSearchParams((prev) => ({
                        ...prev,
                        page: reports.totalPages as number
                    }))}
                    disabled={!reports.totalPages || reports.searchParams.page >= reports.totalPages}
                >
                    <div className="flex items-center gap-2">
                        <span className="not-md:hidden">{t('components.pagination.last')}</span>
                        <ChevronsRight />
                    </div>
                </GenericButton>
            </div>
        </main>
    )
}