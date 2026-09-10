export type ExpenseReportStatus = 'pending' | 'approved' | 'denied' | 'processed'

export interface Attachment {
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
    files: Attachment[]
    status: ExpenseReportStatus
    submitted_at: string
    comment?: string
}