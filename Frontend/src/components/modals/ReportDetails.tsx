import { useTranslation } from "react-i18next"
import type { ExpenseReport } from "../../types/reports"
import DocumentDownloadButton from "../ui/DocumentDownloadButton"
import type { UserRole } from "../../types/users"
import GenericButton from "../ui/GenericButton"
import { useApiClient } from "../../hooks/useApiClient"
import toast from "react-hot-toast"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLocalizedPath } from "../../hooks/useLocalizedPath"

interface Props {
    report: ExpenseReport
    showActionsFor?: UserRole
    close?: () => void
}

function ReportDetails({ report, showActionsFor, close }: Props) {
    const { t } = useTranslation()
    const { request } = useApiClient()
    const navigate = useNavigate()
    const toLocalized = useLocalizedPath()

    const [comment, setComment] = useState("")

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
        const payload = {
            newStatus: 'approved',
            comment: comment.trim() !== "" ? comment.trim() : undefined
        }

        const response = await request(`/reports/-/${report.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            toast.error(t('reports.manager.errors.process'))
            return
        }

        toast.success(t('reports.manager.messages.approved'))
        close && close()
    }

    async function handleDeny() {
        const payload = {
            newStatus: 'denied',
            comment: comment.trim() !== "" ? comment.trim() : undefined
        }

        const response = await request(`/reports/-/${report.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
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
                <p><span className="text-yellow-600 font-semibold">{t('reports.details.fields.submittedBy')}:</span> <span title={t('reports.details.profileLinkTitle')} className="hover:underline cursor-pointer" onClick={() => report.user?.id && navigate(toLocalized(`/profile/${report.user?.id}`))}>{report.user ? `${report.user.first_name} ${report.user.last_name.toUpperCase()} (${report.user.email})` : "N/A"}</span></p>
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
                <div>
                    <div>
                        <label
                            htmlFor="comment"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                        >
                            {t('reports.details.commentInput.label')}
                        </label>

                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('reports.details.commentInput.placeholder')}
                            rows={3}
                            className="
                                w-full border border-gray-300
                                bg-white px-1 py-1 text-sm text-gray-900
                                outline-none transition
                                placeholder:text-gray-400
                                focus:border-yellow-500
                                focus:ring-2 focus:ring-yellow-500/20
                            "
                        >

                        </textarea>
                    </div>

                    <div className="flex justify-end gap-2">
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
                </div>

            )}
        </div>
    )
}

export default ReportDetails