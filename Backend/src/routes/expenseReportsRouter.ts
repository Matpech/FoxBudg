import { Router } from "express";
import { upload, validateReportDocuments } from "../utils/uploads";
import { authenticated } from "../middlewares/authMiddlewares";
import { InvalidTokenException } from "../types/errors";
import { createExpenseReport } from "../repositories/expenseReportsRepo";
import validate from "../utils/validator/validator";
import { reportUploadSchema } from "../utils/validator/schemas/reportSchemas";
import fs from "fs"

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
        console.error(error)
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

export default router