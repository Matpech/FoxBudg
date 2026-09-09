import { Router } from "express";
import { upload, validateReportDocuments } from "../utils/uploads";
import { authenticated } from "../middlewares/authMiddlewares";
import { ApiException, InvalidIdException, InvalidTokenException, NotImplementedException } from "../types/errors";
import { createExpenseReport, getOneReport, getReportAttachment, getReportsFromUser, processReport, searchReports } from "../repositories/expenseReportsRepo";
import validate from "../utils/validator/validator";
import { reportProcessingManagerSchema, reportSearchParamsSchema, reportUploadSchema } from "../utils/validator/schemas/reportSchemas";
import fs from "fs"
import { numericIdSchema, uuidSchema } from "../utils/validator/schemas/generalSchemas";
import { getOneUser } from "../repositories/usersRepo";
import type { ExpenseReportSearchParams } from "../types/expenseReports";

const router = Router()

router.post('/', authenticated, upload.array('documents', 5), async (req, res) => {
    try {
        if (!req.user) {
            throw new InvalidTokenException()
        }
    
        // Validate request body
        const { title, description, amount } = validate<{ title: string, description?: string, amount: number }>(req, reportUploadSchema)
    
        // Validate uploaded documents
        await validateReportDocuments(req.files as Express.Multer.File[])
        const files = req.files as Express.Multer.File[]
    
        // Process report
        const report = await createExpenseReport({
            title,
            description,
            amount,
            files
        }, req.user)

        return res.status(201).json(report)
    } catch (error) {
        throw error
    } finally {
        if (req.files) {
            const files = req.files as Express.Multer.File[]
            const paths = files.map(f => f.path)
            for (const path of paths) {
                fs.unlinkSync(path)
            }
        }
    }
})

router.get('/self', authenticated, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }
    
    const reports = await getReportsFromUser(req.user.id)
    return res.json(reports)
})

router.get('/-/:report_id', authenticated, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    // Validate the report ID against the generic numeric ID schema
    const validationResult = numericIdSchema.validate(parseInt(req.params.report_id as string))
    const reportId = validationResult.value
    if (!reportId) {
        throw new InvalidIdException()
    }

    // Fetch report and verify permissions
    const report = await getOneReport(reportId)
    
    // Case 1: the creator of the ER is always allowed
    if (req.user.id === report.user?.id)
        return res.json(report)

    // Get the role of the user that initiated the request to verify permissions
    // This is way safer than relying on the role from the JWT, which can be out of sync with the DB
    const account = await getOneUser(req.user.id)

    // Case 2: accountants can read the ER if its status is "approved" or "processed"
    if (
        account.role === "accountant" &&
        (report.status === "approved" || report.status === "processed")
    ) return res.json(report)

    // Case 3: managers can read any ER, whatever the status
    if (account.role === "manager") return res.json(report)

    throw new ApiException(403, "ACCESS_DENIED", "You are not allowed to read this expense report")
})

router.patch('/-/:report_id', authenticated, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    // Validate expense report ID
    const validationResult = numericIdSchema.validate(parseInt(req.params.report_id as string))
    const reportId = validationResult.value
    if (!reportId) {
        throw new InvalidIdException()
    }

    // Verify account permissions
    const account = await getOneUser(req.user.id)
    if (account.role === 'employee') {
        throw new ApiException(403, "ACCESS_DENIED", "You are not allowed to perform this action")
    }

    // Fetch the report for further verifications
    const report = await getOneReport(reportId)

    if (account.role === "manager") {
        // Managers have the choice to accept or deny reports that are pending, with an optional comment
        if (report.status !== 'pending') {
            throw new ApiException(409, "REPORT_NOT_PENDING", "You can only process pending expense reports")
        }

        const { newStatus, comment } = validate<{ newStatus: 'approved' | 'denied', comment?: string }>(req, reportProcessingManagerSchema)
        await processReport(reportId, newStatus, comment)
        return res.sendStatus(204)
    } else {
        // Accountants only have the option to mark a report as processed (no body required)
        if (report.status !== 'approved') {
            throw new ApiException(409, "REPORT_NOT_APPROVED", "You can only process approved expense reports")
        }

        await processReport(reportId, "processed")
        return res.sendStatus(204)
    }
})

router.post('/-/search', authenticated, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    // Parse parameters
    let params = validate<ExpenseReportSearchParams | undefined>(req, reportSearchParamsSchema, true)

    // Enforce access control rules
    // - Accountants can only access reports that are either 'approved' or 'processed'
    // - Managers can access reports of any status (no additional verification)
    // - Employees cannot use the endpoint
    
    const account = await getOneUser(req.user.id)
    if (account.role === 'employee') {
        // TODO: allow employees to use this endpoint to access their own reports of any status
        throw new ApiException(403, "ACCESS_DENIED", "You cannot use this search endpoint as an employee")
    }

    if (account.role === 'accountant') {
        // Set the allowed types in the filters
        if (!params || !params.status) {
            params = { page: 1, status: ['approved', 'processed'] }
        }

        // Reject request with a 403 errors if forbidden statuses are specified
        if (params.status && (params.status.includes('pending') || params.status.includes('denied'))) {
            throw new ApiException(403, "FORBIDDEN_FILTERS", "You are not allowed to use these filters")
        }
    }

    // Make the search
    const results = await searchReports(params)

    return res.json(results)
})

router.get('/-/:report_id/document/:document_id', authenticated, async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }
    
    // Parse and verify IDs
    const { report_id, document_id } = req.params as { report_id: string, document_id: string }
    const reportIdValidation = numericIdSchema.validate(parseInt(report_id))
    const reportId = reportIdValidation.value
    if (!reportId) {
        throw new InvalidIdException()
    }
    const documentIdValidation = uuidSchema.validate(document_id)
    const documentId = documentIdValidation.value
    if (!documentId) {
        throw new InvalidIdException('uuid')
    }

    // Verify access permissions with report and account details
    let allowed = false
    const report = await getOneReport(reportId)
    
    if (req.user.id === report.user?.id) allowed = true
    
    const account = await getOneUser(req.user.id)

    if (
        account.role === "accountant" &&
        (report.status === "approved" || report.status === "processed")
    ) allowed = true

    if (account.role === "manager") allowed = true

    if (!allowed) {
        throw new ApiException(403, "ACCESS_DENIED", "You are not allowed to access documents from this expense report")
    }

    // Read the document and send it to the client as a file download
    const attachment = await getReportAttachment(reportId, documentId)

    return res
        .type('application/pdf')
        .attachment(attachment.filename)
        .send(attachment.data)
})

export default router