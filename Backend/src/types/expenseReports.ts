export type ExpenseReportStatus = 'pending' | 'approved' | 'denied' | 'processed'

export interface ExpenseReportAttachment {
    id: string
    name: string
}

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

export interface ExpenseReportCreateParams {
    title: string
    description?: string
    amount: number
    files: Express.Multer.File[]
}

export interface ExpenseReportSearchParams {
    status?: ExpenseReportStatus[]
    page: number
}