import { useTranslation } from "react-i18next"
import type { ExpenseReport } from "../../types/reports"
import DocumentDownloadButton from "../ui/DocumentDownloadButton"
import type { UserRole } from "../../types/users"

interface Props {
    report: ExpenseReport
    showActionsFor?: UserRole
}

function ReportDetails({ report, showActionsFor }: Props) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-col gap-4">
            {/* General information */}
            <div>
                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.title')}:</span> {report.title}</p>
                {report.description && (
                    <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.description')}:</span> {report.description}</p>
                )}
                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.submittedBy')}:</span> {report.user ? `${report.user.first_name} ${report.user.last_name.toUpperCase()}` : "N/A"}</p>
                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.amount')}:</span> {report.amount}€</p>
                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.date')}:</span> {new Date(report.submitted_at).toLocaleString()}</p>
            </div>

            {/* Attached documents */}
            <div>
                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.attachments')}:</span></p>
                <div className="flex gap-2">
                    {report.files.map((attachment) => (
                        <DocumentDownloadButton
                            reportId={report.id}
                            document={attachment}
                        />
                    ))}
                </div>
            </div>

            {/* Status + comment */}
            <div>
                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.status')}:</span> {t(`reports.status.${report.status}`)}</p>
                {report.comment && (
                    <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.comment')}:</span> {report.comment}</p>
                )}
            </div>
        </div>
    )
}

export default ReportDetails