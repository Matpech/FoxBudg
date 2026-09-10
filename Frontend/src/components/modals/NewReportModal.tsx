import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import GenericButton from "../ui/GenericButton"
import { useApiClient } from "../../hooks/useApiClient"
import toast from "react-hot-toast"

interface Props {
    close: () => void
}

function NewReportModal({ close }: Props) {
    const { t } = useTranslation()
    const { request } = useApiClient()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState(0)
    const [attachments, setAttachments] = useState<File[] | null>(null)
    const [forceDisableButton, setForceDisableButton] = useState(false)

    const buttonDisabled = useMemo(() => {
        if (forceDisableButton) return true

        if (title.trim().length < 3 || title.trim().length > 64) return true
        if (description.trim().length > 300) return true
        if (!attachments || attachments.length === 0) return true
    }, [title, description, attachments, forceDisableButton])

    async function handleSubmit() {
        // Force disable the submit button
        setForceDisableButton(true)

        // Build the FormData payload
        const payload = new FormData()

        payload.set("title", title)
        if (description.trim() !== "") payload.set("description", description)
        payload.set("amount", amount.toString())
        
        if (!attachments) return
        for (const file of attachments) {
            payload.append("documents", file)
        }

        // Send the request
        const response = await request('/reports', {
            method: "POST",
            body: payload
        })

        if (!response.ok) {
            // Failure : display an error toast and re-enable the button after 1s
            toast.error(t('reports.new.submitError'))
            setTimeout(() => {
                setForceDisableButton(false)
            }, 1000)
        } else {
            // Success : display a success toast and close the modal
            toast.success(t('reports.new.submitSuccess'))
            close()
        }
    }

    return (
        <div className="flex flex-col gap-2 md:w-96">
            <div>
                <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                >
                    {t('reports.new.labels.title')}
                </label>

                <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('reports.new.labels.title')}
                    className="
                        w-full border border-gray-300
                        bg-white px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:border-yellow-500
                        focus:ring-2 focus:ring-yellow-500/20
                    "
                />
            </div>

            <div>
                <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                >
                    {t('reports.new.labels.description')}
                </label>

                <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('reports.new.labels.description')}
                    className="
                        w-full border border-gray-300
                        bg-white px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:border-yellow-500
                        focus:ring-2 focus:ring-yellow-500/20
                    "
                />
            </div>

            <div>
                <label
                    htmlFor="amount"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                >
                    {t('reports.new.labels.amount')}
                </label>

                <input
                    id="amount"
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Math.max(parseFloat(e.target.value.replace(',', '.')), 0))}
                    placeholder={t('reports.new.labels.amount')}
                    className="
                        w-full border border-gray-300
                        bg-white px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:border-yellow-500
                        focus:ring-2 focus:ring-yellow-500/20
                    "
                />
            </div>

            <div>
                <label
                    htmlFor="attachments"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-100"
                >
                    {t('reports.new.labels.attachments')}
                </label>

                <input
                    id="attachments"
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={(e) => {
                        if (!e.target.files) {
                            setAttachments(null)
                            return
                        }

                        setAttachments(Array.from(e.target.files))
                    }}
                    className="
                        file:px-4 file:py-3 file:mr-2
                        text-sm font-semibold
                        file:shadow-sm file:transition-colors
                        focus:outline-none focus:ring focus:ring-offset-1
                        cursor-pointer
                        file:text-white
                        file:bg-yellow-600 file:hover:bg-yellow-700
                        file:focus:ring-yellow-500
                        file:active:bg-yellow-800
                    "
                />
            </div>

            <GenericButton
                click={handleSubmit}
                disabled={buttonDisabled}
            >
                {t('reports.new.submitButton')}
            </GenericButton>
        </div>
    )
}

export default NewReportModal