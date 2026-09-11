import { useTranslation } from "react-i18next"
import AdvancedReportsTable from "../components/AdvancedReportsTable"
import { useReports } from "../hooks/useReports"
import GenericButton from "../components/ui/GenericButton"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export function ReportsManagerPage() {
    const { t } = useTranslation()

    const reports = useReports()

    // TODO: Add access control

    return (
        <main>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-yellow-600">{t('reports.manager.pageName')}</h2>
                <p className="italic dark:text-white">{t('reports.manager.pageDescription')}</p>
            </div>

            <AdvancedReportsTable reports={reports.results} updateData={reports.search} />

            <div className={`mt-2 flex gap-1 justify-center items-center ${!reports.results && 'hidden'}`}>
                <GenericButton click={() => {}} disabled={reports.searchParams.page <= 1}>
                    <div className="flex items-center gap-2">
                        <ChevronsLeft />
                        <span className="not-md:hidden">First</span>
                    </div>
                </GenericButton>

                <GenericButton click={() => {}} disabled={reports.searchParams.page <= 1}>
                    <div className="flex items-center gap-2">
                        <ChevronLeft />
                        <span className="not-md:hidden">Previous</span>
                    </div>
                </GenericButton>

                <p className="px-4 text:lg md:text-xl dark:text-white">Page {reports.searchParams.page}/{reports.totalPages}</p>

                <GenericButton click={() => {}} disabled={!reports.totalPages || reports.searchParams.page >= reports.totalPages}>
                    <div className="flex items-center gap-2">
                        <span className="not-md:hidden">Next</span>
                        <ChevronRight />
                    </div>
                </GenericButton>

                <GenericButton click={() => {}} disabled={!reports.totalPages || reports.searchParams.page >= reports.totalPages}>
                    <div className="flex items-center gap-2">
                        <span className="not-md:hidden">Last</span>
                        <ChevronsRight />
                    </div>
                </GenericButton>
            </div>
        </main>
    )
}