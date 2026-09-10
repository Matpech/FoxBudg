import { FileDown } from "lucide-react"
import type { Attachment } from "../../types/reports"

interface Props {
    reportId: number
    document: Attachment
}

function DocumentDownloadButton({ document, reportId }: Props) {
    const downloadUrl = `/api/reports/-/${reportId}/document/${document.id}`

    return (
        <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
                flex flex-col items-center justify-center gap-2
                aspect-square w-32 p-3 shadow-sm
        
                border border-yellow-600
                hover:border-yellow-700
                focus:outline-none focus:ring-2
                focus:ring-yellow-500 focus:ring-offset-2
                active:border-yellow-800
            "
            title={document.name}
        >
            <FileDown size={40} color="var(--color-yellow-600)" />

            <span className="w-full truncate text-center text-sm">
                {document.name}
            </span>
        </a>
    )
}

export default DocumentDownloadButton