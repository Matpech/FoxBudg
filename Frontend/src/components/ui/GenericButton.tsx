import type { ReactNode } from "react"

interface Props {
    type?: 'primary' | 'green' | 'danger'
    children: ReactNode
    click: Function
    disabled?: boolean
    className?: string
    title?: string
}

function GenericButton({ type = 'primary', children, click, disabled, className, title }: Props) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation()
                click()
            }}
            disabled={disabled}
            title={title}
            className={`
                px-4 py-3
                text-sm font-semibold text-white
                shadow-sm transition
                cursor-pointer

                focus:outline-none focus:ring-2  focus:ring-offset-2

                ${type === 'primary' && `
                    bg-yellow-600
                    hover:bg-yellow-700
                    enabled:focus:ring-yellow-500
                    active:bg-yellow-800
                `}

                ${type === 'green' && `
                    bg-green-600
                    hover:bg-green-700
                    enabled:focus:ring-green-500
                    active:bg-green-800
                `}

                ${type === 'danger' && `
                    bg-red-600
                    hover:bg-red-700
                    enabled:focus:ring-red-500
                    active:bg-red-800
                `}

                disabled:cursor-default
                disabled:bg-gray-600
                disabled:hover:bg-gray-700

                ${className}
            `}
        >
            {children}
        </button>
    )
}

export default GenericButton