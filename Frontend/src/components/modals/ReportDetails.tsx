import { useTranslation } from "react-i18next"
import type { ExpenseReport } from "../../types/reports"
import DocumentDownloadButton from "../ui/DocumentDownloadButton"
import type { UserRole } from "../../types/users"
import GenericButton from "../ui/GenericButton"
import { useApiClient } from "../../hooks/useApiClient"
import toast from "react-hot-toast"

interface Props {
    report: ExpenseReport
    showActionsFor?: UserRole
    close?: () => void
}

function ReportDetails({ report, showActionsFor, close }: Props) {
    const { t } = useTranslation()
    const { request } = useApiClient()

    async function handleProcess() {
        const response = await request(`/reports/-/${report.id}`, {
            method: "PATCH"
        })

        if (!response.ok) {
            toast.error(t('reports.manager.errors.process'))
            return
        }

        toast.success(t('reports.manager.messages.processed'))
        close && close()
    }

    async function handleApprove() {
        const response = await request(`/reports/-/${report.id}`, {
            method: "PATCH",
            body: JSON.stringify({ newStatus: 'approved' })
        })

        if (!response.ok) {
            toast.error(t('reports.manager.errors.process'))
            return
        }

        toast.success(t('reports.manager.messages.approved'))
        close && close()
    }

    async function handleDeny() {
        const response = await request(`/reports/-/${report.id}`, {
            method: "PATCH",
            body: JSON.stringify({ newStatus: 'denied' })
        })

        if (!response.ok) {
            toast.error(t('reports.manager.errors.process'))
            return
        }

        toast.success(t('reports.manager.messages.denied'))
        close && close()
    }

    return (
        <div className="flex flex-col gap-4">
            {/* General information */}
            <div>
                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.title')}:</span> {report.title}</p>
                {report.description && (
                    <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.description')}:</span> {report.description}</p>
                )}
                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.submittedBy')}:</span> {report.user ? `${report.user.first_name} ${report.user.last_name.toUpperCase()} (${report.user.email})` : "N/A"}</p>
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

            {/* Actions that can be performed */}
            {showActionsFor === 'accountant' && report.status === 'approved' && (
                <div className="flex justify-end">
                    <GenericButton
                        type="green"
                        click={() => handleProcess()}
                    >
                        {t('reports.manager.actions.process')}
                    </GenericButton>
                </div>
            )}

            {showActionsFor === 'manager' && report.status === 'pending' && (
                <div className="flex justify-end gap-2">
                    {/* TODO: Add comment field */}
                    <GenericButton
                        type="green"
                        click={() => handleApprove()}
                    >
                        {t('reports.manager.actions.approve')}
                    </GenericButton>

                    <GenericButton
                        type="danger"
                        click={() => handleDeny()}
                    >
                        {t('reports.manager.actions.deny')}
                    </GenericButton>
                </div>
            )}
        </div>
    )
}

export default ReportDetails