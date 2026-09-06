import { Router } from "express";
import { upload, validateReportDocuments } from "../utils/uploads";
import { authenticated } from "../middlewares/authMiddlewares";
import { ApiException, InvalidIdException, InvalidTokenException, ValidationException } from "../types/errors";
import { createExpenseReport, getOneReport, getReportsFromUser } from "../repositories/expenseReportsRepo";
import validate from "../utils/validator/validator";
import { reportUploadSchema } from "../utils/validator/schemas/reportSchemas";
import fs from "fs"
import { numericIdSchema } from "../utils/validator/schemas/generalSchemas";
import { getOneUser } from "../repositories/usersRepo";

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

export default router