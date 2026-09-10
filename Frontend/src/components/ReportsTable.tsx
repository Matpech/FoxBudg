import { useTranslation } from "react-i18next"
import type { ExpenseReport } from "../types/reports"
import GenericButton from "./ui/GenericButton"
import { useState } from "react"
import { createPortal } from "react-dom"
import Modal from "./ui/Modal"
import DocumentDownloadButton from "./ui/DocumentDownloadButton"

interface Props {
    reports: ExpenseReport[] | null
}

function ReportsTable({ reports }: Props) {
    const { t } = useTranslation()

    const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null)

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
                        click={() => {}}
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
                    <div className="flex flex-col gap-4">
                        {/* General information */}
                        <div>
                            <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.title')}:</span> {selectedReport.title}</p>
                            {selectedReport.description && (
                                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.description')}:</span> {selectedReport.description}</p>
                            )}
                            <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.submittedBy')}:</span> {selectedReport.user ? `${selectedReport.user.first_name} ${selectedReport.user.last_name.toUpperCase()}` : "N/A"}</p>
                            <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.amount')}:</span> {selectedReport.amount}€</p>
                            <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.date')}:</span> {new Date(selectedReport.submitted_at).toLocaleString()}</p>
                        </div>

                        {/* Attached documents */}
                        <div>
                            <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.attachments')}:</span></p>
                            <div className="flex gap-2">
                                {selectedReport.files.map((attachment) => (
                                    <DocumentDownloadButton
                                        reportId={selectedReport.id}
                                        document={attachment}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Status + comment */}
                        <div>
                            <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.status')}:</span> {t(`reports.status.${selectedReport.status}`)}</p>
                            {selectedReport.comment && (
                                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.comment')}:</span> {selectedReport.comment}</p>
                            )}
                        </div>
                    </div>
                </Modal>, document.body
            )}
        </div>
    )
}

export default ReportsTable