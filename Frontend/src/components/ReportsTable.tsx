import { useTranslation } from "react-i18next"
import type { ExpenseReport } from "../types/reports"
import GenericButton from "./ui/GenericButton"
import { useState } from "react"
import { createPortal } from "react-dom"
import Modal from "./ui/Modal"
import NewReportModal from "./modals/NewReportModal"
import ReportDetails from "./modals/ReportDetails"

interface Props {
    reports: ExpenseReport[] | null
    reload: () => void
}

function ReportsTable({ reports, reload }: Props) {
    const { t } = useTranslation()

    const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null)
    const [newModalOpen, setNewModalOpen] = useState(false)

    return (
        <div className="relative mt-8">
            <div className="
                dark:text-white
                border border-yellow-600
                before:absolute
                before:top-0 before:left-0
                before:w-6 before:h-6
                before:border-t-2 before:border-l-2
                before:border-yellow-600
            ">
                <div className="flex items-center justify-between mb-2 px-4 pt-3">
                    <p className="text-3xl font-bold">{t('reports.table.title')}</p>
                    <GenericButton
                        click={() => setNewModalOpen(true)}
                    >
                        {t('reports.table.buttonText')}
                    </GenericButton>
                </div>

                {!reports && (
                    <p className="italic text-center py-2">{t('reports.table.loadingMessage')}</p>
                )}

                {reports && reports.length === 0 && (
                    <p className="italic text-center py-2">{t('reports.table.noReportsMessage')}</p>
                )}

                {reports && reports.length > 0 && (<table className="
                    w-full table-fixed
                    not-md:text-sm
                ">
                    <thead className="text-left font-semibold">
                        <tr className="border-b border-yellow-600">
                            <th className="px-2 py-1 md:w-7/12">{t('reports.table.headers.title')}</th>
                            <th className="px-2 py-1 md:w-2/12">{t('reports.table.headers.status')}</th>
                            <th className="px-2 py-1 md:w-3/12">{t('reports.table.headers.date')}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reports.map((report) => (
                            <tr key={report.id} className="even:bg-gray-200 dark:even:bg-zinc-900">
                                <td className="px-2 cursor-pointer" onClick={() => setSelectedReport(report)}>{report.title}</td>
                                <td className="px-2">{t(`reports.status.${report.status}`)}</td>
                                <td className="px-2">{new Date(report.submitted_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>)}
            </div>

            {selectedReport && createPortal(
                <Modal title={t('reports.details.title', { id: selectedReport.id })} onClose={() => setSelectedReport(null)} >
                    <ReportDetails report={selectedReport} />
                </Modal>, document.body
            )}

            {newModalOpen && createPortal(
                <Modal title={t('reports.new.modalTitle')} onClose={() => setNewModalOpen(false)} >
                    <NewReportModal close={() => setNewModalOpen(false)} onSuccess={reload} />
                </Modal>, document.body
            )}
        </div>
    )
}

export default ReportsTable