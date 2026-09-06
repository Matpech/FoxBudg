import { DatabaseException } from "../types/errors";
import type { ExpenseReport, ExpenseReportAttachment, ExpenseReportCreateParams } from "../types/expenseReports";
import type { JwtData } from "../types/security";
import { pool } from "../utils/db";
import crypto from "crypto"
import fs from "fs"

/**
 * Save an expense report in the database.
 * 
 * This function can create a report with data such as:
 * - The title of the expense
 * - An optional description
 * - A list of documents uploaded through Multer
 * 
 * User info is also passed to build the return value.
 * 
 * @param reportDetails Information about the expense report itself
 * @param userInfo Information about the creator of the expense report
 * @returns a populated ExpenseReport
 */
export async function createExpenseReport(reportDetails: ExpenseReportCreateParams, userInfo: JwtData) {
    const client = await pool.connect()
    
    try {
        await client.query("BEGIN")
        
        // Step 1: push the report in the expense_reports table
        const reportResult = await client.query(
            "INSERT INTO expense_reports (user_id, title, description, amount) VALUES ($1, $2, $3, $4) RETURNING *",
            [userInfo.id, reportDetails.title, reportDetails.description, reportDetails.amount]
        )

        if (!reportResult.rows[0]) {
            throw new Error("Report could not be created")
        }

        const rawReportInfo = reportResult.rows[0]

        // Step 2: copy files to storage volume
        const attachments: ExpenseReportAttachment[] = []
        const values = [rawReportInfo.id]
        reportDetails.files.forEach(file => {
            const documentId = crypto.randomUUID()
            const documentName = file.originalname
            fs.copyFileSync(file.path, `/data/${documentId}`)
            attachments.push({
                id: documentId,
                name: documentName
            })
            values.push(documentId, documentName)
        })

        // Step 3: register files in the document_metadata table
        const indexes: string[] = []
        for (let i = 0; i < attachments.length; i++) {
            indexes.push(`($${i*2+2}, $1, $${i*2+3})`)
        }
        await client.query(
            `
                INSERT INTO document_metadata (id, report_id, original_name)
                VALUES ${indexes.join(", ")}
            `, values
        )

        // Step 4: commit the transaction
        await client.query("COMMIT")

        // Step 5: return report information to the user
        const insertedReport: ExpenseReport = {
            id: rawReportInfo.id,
            user: {
                id: userInfo.id,
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                email: userInfo.email
            },
            title: rawReportInfo.title,
            description: rawReportInfo.description,
            amount: rawReportInfo.amount,
            files: attachments,
            status: rawReportInfo.status,
            submitted_at: rawReportInfo.submitted_at
        }

        return insertedReport
    } catch (error) {
        await client.query("ROLLBACK")
        throw new DatabaseException(error as Error)
    } finally {
        client.release()
    }
}