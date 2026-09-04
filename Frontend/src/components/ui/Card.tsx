import type { ReactNode } from "react"

interface Props {
    children: ReactNode
}

function Card({ children }: Props) {
    return (
        <div className="bg-white/90 dark:bg-zinc-900 p-8 shadow-xl ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-sm">
            {children}
        </div>
    )
}

export default Card