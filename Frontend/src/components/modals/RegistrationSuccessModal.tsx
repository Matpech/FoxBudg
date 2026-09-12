import { useState } from "react";
import { useTranslation } from "react-i18next";
import GenericButton from "../ui/GenericButton";
import { Copy, Eye, EyeOff } from "lucide-react";

interface Props {
    password: string
    onAcknowledge: () => void
}

function RegistrationSuccessModal({ password, onAcknowledge }: Props) {
    const { t } = useTranslation(['users', 'common'])

    const [showPassword, setShowPassword] = useState(false)
    const [buttonDisabled, setButtonDisabled] = useState(true)

    // Only enable the acknowledgement button after 5 seconds
    setTimeout(() => {
        setButtonDisabled(false)
    }, 5000)
    
    return (
        <div className="flex flex-col gap-4 max-w-xl">
            <div>
                <p className="text-lg md:text-xl italic">{t('userManager.newUser.postRegister.subtitle')}</p>
                <p className="whitespace-pre-line">{t('userManager.newUser.postRegister.instructions')}</p>
            </div>

            <div className="flex">
                <input
                    type={showPassword ? 'text' : 'password'}
                    disabled
                    value={password}
                    className="
                        w-full border border-gray-300
                        bg-white px-4 py-3 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:border-yellow-500
                        focus:ring-2 focus:ring-yellow-500/20
                    "
                />

                <GenericButton
                    click={() => setShowPassword(!showPassword)}
                    title={t('userManager.newUser.postRegister.tooltips.showPassword')}
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                </GenericButton>
                
                <GenericButton
                    click={() => navigator.clipboard.writeText(password)}
                    title={t('userManager.newUser.postRegister.tooltips.copyPassword')}
                >
                    <Copy />
                </GenericButton>
            </div>

            {buttonDisabled && <p>{t('userManager.newUser.postRegister.buttonDisabledMessage')}</p>}

            <GenericButton
                type="danger"
                disabled={buttonDisabled}
                click={onAcknowledge}
            >
                {t('userManager.newUser.postRegister.buttonText')}
            </GenericButton>
        </div>
    )
}

export default RegistrationSuccessModal