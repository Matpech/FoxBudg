import { useTranslation } from "react-i18next";
import type { ExpenseReport } from "../types/reports";
import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import Modal from "./ui/Modal";
import ReportDetails from "./modals/ReportDetails";
import { AuthContext } from "../contexts/AuthContext";

interface Props {
    reports: ExpenseReport[] | null
}

function AdvancedReportsTable({ reports }: Props) {
    const { t } = useTranslation()
    const { user } = useContext(AuthContext)

    const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null)

    // TODO: Add access control checks

    return (
        <div className="relative">
            <div className="
                dark:text-white
                border border-yellow-600
                before:absolute
                before:top-0 before:left-0
                before:w-6 before:h-6
                before:border-t-2 before:border-l-2
                before:border-yellow-600
            ">
                {!reports && (
                    <p className="italic text-center py-2">{t('reports.table.loadingMessage')}</p>
                )}

                {reports && reports.length === 0 && (
                    <p className="italic text-center py-2">{t('reports.table.noReportsMessage')}</p>
                )}

                {reports && reports.length > 0 && (
                    <table className="w-full table-fixed not-md:text-sm">
                        <thead className="text-left font-semibold">
                            <tr className="border-b border-yellow-600">
                                <th className="px-2 py-1 md:w-4/12">{t('reports.table.headers.title')}</th>
                                <th className="px-2 py-1 md:w-3/12">{t('reports.table.headers.user')}</th>

                                {/* Status and date columns hidden on mobile due to size limitations */}
                                <th className="px-2 py-1 md:w-2/12 not-md:hidden">{t('reports.table.headers.status')}</th>
                                <th className="px-2 py-1 md:w-3/12 not-md:hidden">{t('reports.table.headers.date')}</th>
                            </tr>
                        </thead>

                        {/* TODO: Highlight reports that require attention (especially with hidden statuses on mobile) */}
                        <tbody>
                            {reports.map((report) => (
                                <tr
                                    key={report.id}
                                    className="even:bg-gray-200 dark:even:bg-zinc-900 cursor-pointer"
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <td className="px-2 not-md:py-1">{report.title}</td>
                                    <td className="px-2 not-md:py-1">{report.user?.email ?? "N/A"}</td>
                                    <td className="px-2 not-md:py-1 not-md:hidden">{t(`reports.status.${report.status}`)}</td>
                                    <td className="px-2 not-md:py-1 not-md:hidden">{new Date(report.submitted_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedReport && createPortal(
                <Modal title={"Test"} onClose={() => setSelectedReport(null)}>
                    <ReportDetails report={selectedReport} showActionsFor={user?.role || undefined} />
                </Modal>, document.body
            )}
        </div>
    )
}

export default AdvancedReportsTable