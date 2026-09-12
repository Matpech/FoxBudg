import { CircleX } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

interface Props {
    children: ReactNode,
    title: string,
    onClose?: () => void
}

function Modal({ children, title, onClose }: Props) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        requestAnimationFrame(() => {
            setVisible(true)
        })
    }, [])

    function handleClose() {
        if (!onClose) return

        setVisible(false)
        setTimeout(() => {
            onClose()
        }, 200)
    }
    
    return (
        <div
            onClick={onClose ? handleClose : () => {}}
            className={`
                fixed inset-0 z-1000
                flex items-center justify-center
                bg-black/50 backdrop-blur-sm
                transition-opacity duration-200
                ${visible ? "opacity-100" : "opacity-0"}
            `}
        >
            <div className="relative">
                <div
                    className="
                        border border-yellow-600
                        p-4 mx-auto
                        min-w-72 md:max-w-[60vw]
                        dark:text-white
                        bg-white dark:bg-zinc-950

                        before:absolute
                        before:top-0 before:left-0
                        before:w-6 before:h-6
                        before:border-t-2 before:border-l-2
                        before:border-yellow-600
                    "
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xl font-bold">{title}</p>
                        <button onClick={onClose ? handleClose : () => {}} className={`cursor-pointer ${!onClose && 'hidden'}`}>
                            <CircleX />
                        </button>
                    </div>

                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal