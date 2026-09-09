/**
 * All valid statuses for expense reports :
 * - pending (the report has been submitted by an employee and is awaiting approval by a manager)
 * - approved (the report has been approved by a manager and is now waiting to be marked as processed by an accountant)
 * - denied (the report has been permanently closed by a manager)
 * - processed (the report has been marked as processed by an accountant)
 */
export type ExpenseReportStatus = 'pending' | 'approved' | 'denied' | 'processed'

/**
 * Information about an attachment. The ID can be used to download the attachment from the API.
 */
export interface ExpenseReportAttachment {
    id: string
    name: string
}

/**
 * Attachment data for download operations, containing the PDF data and original file name.
 */
export interface AttachmentFile {
    data: Buffer
    filename: string
}

/**
 * Full information about an expense report saved in the database.
 */
export interface ExpenseReport {
    id: number
    user?: {
        id: number
        first_name: string
        last_name: string
        email: string
    }
    title: string
    description?: string
    amount: number
    files: ExpenseReportAttachment[]
    status: ExpenseReportStatus
    submitted_at: Date
    comment?: string
}

/**
 * Parameters required to submit a new expense report to the database.
 */
export interface ExpenseReportCreateParams {
    title: string
    description?: string
    amount: number
    files: Express.Multer.File[]
}

/**
 * Search parameters used to narrow down results and for pagination.
 */
export interface ExpenseReportSearchParams {
    status?: ExpenseReportStatus[]
    page: number
}