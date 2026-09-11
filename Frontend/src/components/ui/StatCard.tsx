interface Props {
    label: string
    value: any
    className?: string
}

function StatCard({ label, value, className }: Props) {
    return (
        <div className={`
                relative flex flex-col items-center justify-center
                border border-yellow-600 p-2 w-full md:w-56 h-40
                text-center dark:text-white
                bg-white/90 dark:bg-zinc-900

                before:absolute
                before:top-0 before:left-0
                before:w-6 before:h-6
                before:border-t-2 before:border-l-2
                before:border-yellow-600

                ${className}
            `}
        >
            <p className="text-2xl md:text-4xl font-bold">{value}</p>
            <p className="md:text-2xl">{label}</p>
        </div>
    )
}

export default StatCard