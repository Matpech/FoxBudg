import type { ReactNode } from "react"

interface Props {
    children: ReactNode
    className?: string
}

function Card({ children, className }: Props) {
    return (
        <div className={`
            p-8
            bg-white/90 dark:bg-zinc-900
            border border-yellow-600
            shadow-xl backdrop-blur-sm

            before:absolute
            before:top-0 before:left-0
            before:w-6 before:h-6
            before:border-t-2 before:border-l-2
            before:border-yellow-600

            ${className}
        `}>
            {children}
        </div>
    )
}

export default Card