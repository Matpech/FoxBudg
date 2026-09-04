import type { ReactNode } from "react"

interface Props {
    children: ReactNode
    click: Function
    disabled?: boolean
}

function GenericButton({ children, click, disabled }: Props) {
    return (
        <button
            onClick={() => click}
            disabled={disabled}
            className="
                bg-yellow-600 px-4 py-3
                text-sm font-semibold text-white
                shadow-sm transition
                cursor-pointer
                hover:bg-yellow-700
                focus:outline-none focus:ring-2
                enabled:focus:ring-yellow-500 focus:ring-offset-2
                active:bg-yellow-800

                disabled:cursor-default
                disabled:bg-gray-600
                disabled:hover:bg-gray-700
            "
        >
            {children}
        </button>
    )
}

export default GenericButton