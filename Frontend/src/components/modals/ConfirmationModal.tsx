import { useEffect, useState } from "react"
import GenericButton from "../ui/GenericButton"
import { useTranslation } from "react-i18next"

interface Props {
    onConfirm: () => void
    onCancel: () => void
    delay?: number
    message?: string
    buttonLabel?: string
}

function ConfirmationPrompt({ onConfirm, onCancel, delay, message, buttonLabel }: Props) {
    const { t } = useTranslation()
    
    const [waiting, setWaiting] = useState(true)

    useEffect(() => {
        const id = setTimeout(() => {
            setWaiting(false)
        }, delay || 1000)

        return () => {
            window.clearTimeout(id)
        }
    }, [])
    
    return (
        <div>
            <p className="dark:text-white">{message || t('components.confirmPrompt.defaults.message')}</p>

            <div className="flex justify-end gap-2">
                <GenericButton
                    click={onCancel}
                >
                    {t('components.confirmPrompt.cancelButton')}
                </GenericButton>

                <GenericButton
                    type="danger"
                    disabled={waiting}
                    click={onConfirm}
                >
                    {buttonLabel || t('components.confirmPrompt.defaults.confirmButton')}
                </GenericButton>
            </div>
        </div>
    )
}

export default ConfirmationPrompt