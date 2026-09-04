interface Props {
    title: string
    message: string
}

function ErrorBlock({ title, message }: Props) {
    return (
        <div className="border border-red-600 bg-red-600/20 p-4">
            <p className="text-red-600 font-bold">{title}</p>
            <p className="text-gray-900 dark:text-white">{message}</p>
        </div>
    )
}

export default ErrorBlock