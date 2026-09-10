import { Info, TriangleAlert } from "lucide-react"

interface Props {
    type: 'info' | 'danger'
    title: string
    message: string
}

function MessageBlock({ type, title, message }: Props) {
    return (
        <div className="relative">
            <div
                className={`
                    p-4
                    shadow-xl backdrop-blur-xs
                    border

                    ${type === 'info' && `
                        border-yellow-600 before:border-yellow-600
                        bg-yellow-600/10
                    `}

                    ${type === 'danger' && `
                        border-red-600 before:border-red-600    
                        bg-red-600/10
                    `}-

                    before:absolute
                    before:top-0 before:left-0
                    before:w-6 before:h-6
                    before:border-t-2 before:border-l-2
                `}
            >
                <div className="flex items-center gap-1">
                    {type === 'info' && <Info color="var(--color-yellow-600)" />}
                    {type === 'danger' && <TriangleAlert color="var(--color-red-600)" />}

                    <p className={
                        `text-xl font-semibold
                        ${type === 'info' && 'text-yellow-600'}
                        ${type === 'danger' && 'text-red-600'}
                    `}>{title}</p>
                </div>

                <p className="dark:text-white">{message}</p>
            </div>
        </div>
    )
}

export default MessageBlock