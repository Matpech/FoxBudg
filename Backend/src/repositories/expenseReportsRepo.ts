import { ApiException, DatabaseException, NotFoundException } from "../types/errors";
import type { AttachmentFile, ExpenseReport, ExpenseReportAttachment, ExpenseReportCreateParams, ExpenseReportSearchParams } from "../types/expenseReports";
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
 * - An amount
 * - A list of documents uploaded through Multer
 * 
 * User info is also passed to build the return value.
 * 
 * @param reportDetails Information about the expense report itself
 * @param userInfo Information about the creator of the expense report
 * @returns a populated ExpenseReport
 * @throws DatabaseException
 */
export async function createExpenseReport(reportDetails: ExpenseReportCreateParams, userInfo: JwtData): Promise<ExpenseReport> {
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

/**
 * Fetch reports for a specific user
 * 
 * @param userId The ID of the user to filter reports
 * @returns an array of reports created by the user
 * @throws DatabaseException
 */
export async function getReportsFromUser(userId: number): Promise<ExpenseReport[]> {
    try {
        const result = await pool.query<ExpenseReport>(
            `
                SELECT
                    er.id,
                    er.title,
                    er.description,
                    er.amount,
                    er.status,
                    er.submitted_at,
                    er.comment,

                    CASE
                        WHEN u.id IS NOT NULL THEN
                            json_build_object(
                                'id', u.id,
                                'first_name', u.first_name,
                                'last_name', u.last_name,
                                'email', u.email
                            )
                        ELSE NULL
                    END AS "user",

                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', dm.id,
                                'name', dm.original_name
                            )
                        ) FILTER (WHERE dm.id IS NOT NULL),
                        '[]'::json
                    ) AS files

                FROM expense_reports er
                LEFT JOIN users u ON u.id = er.user_id
                LEFT JOIN document_metadata dm ON dm.report_id = er.id

                WHERE er.user_id = $1

                GROUP BY er.id, u.id
                ORDER BY er.submitted_at DESC;
            `, [userId]
        )

        return result.rows
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Fetch a single report by ID
 * 
 * @param reportId The ID of the report to fetch
 * @returns the requested expense report
 * @throws NotFoundException or DatabaseException
 */
export async function getOneReport(reportId: number): Promise<ExpenseReport> {
    try {
        const result = await pool.query<ExpenseReport>(
            `
                SELECT
                    er.id,
                    er.title,
                    er.description,
                    er.amount,
                    er.status,
                    er.submitted_at,
                    er.comment,

                    CASE
                        WHEN u.id IS NOT NULL THEN
                            json_build_object(
                                'id', u.id,
                                'first_name', u.first_name,
                                'last_name', u.last_name,
                                'email', u.email
                            )
                        ELSE NULL
                    END AS "user",

                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', dm.id,
                                'name', dm.original_name
                            )
                        ) FILTER (WHERE dm.id IS NOT NULL),
                        '[]'::json
                    ) AS files

                FROM expense_reports er
                LEFT JOIN users u ON u.id = er.user_id
                LEFT JOIN document_metadata dm ON dm.report_id = er.id

                WHERE er.id = $1

                GROUP BY er.id, u.id
                ORDER BY er.submitted_at DESC;
            `, [reportId]
        )

        if (!result.rows[0]) {
            throw new NotFoundException("Expense report")
        }

        return result.rows[0]
    } catch (error) {
        if (error instanceof ApiException) throw error
        throw new DatabaseException(error as Error)
    }
}

interface SearchOutput {
    total: number
    results: ExpenseReport[]
    next: boolean
}

/**
 * Search all expense reports and return the ones that match specified parameters.
 * 
 * This function returns a paginated list of results (20 results per page).
 * 
 * @param params An object containing all parameters used for search (optional)
 * @returns The paginated results, along with the total results count and a boolean flag to tell if page + 1 exists
 * @throws DatabaseException
 */
export async function searchReports(params?: ExpenseReportSearchParams): Promise<SearchOutput> {
    const fields = []
    const values: any[] = []
    let index = 1

    const resultsPerPage = 20
    const offset = ((params?.page ?? 1) - 1) * resultsPerPage

    // Build query dynamically
    if (params && params.status) {
        fields.push(`er.status = ANY($${index++})`)
        values.push(params.status)
    }

    const query = `
        SELECT
            er.id,
            er.title,
            er.description,
            er.amount,
            er.status,
            er.submitted_at,
            er.comment,

            CASE
                WHEN u.id IS NOT NULL THEN
                    json_build_object(
                        'id', u.id,
                        'first_name', u.first_name,
                        'last_name', u.last_name,
                        'email', u.email
                    )
                ELSE NULL
            END AS "user",

            COALESCE(
                json_agg(
                    json_build_object(
                        'id', dm.id,
                        'name', dm.original_name
                    )
                ) FILTER (WHERE dm.id IS NOT NULL),
                '[]'::json
            ) AS files

        FROM expense_reports er
        LEFT JOIN users u ON u.id = er.user_id
        LEFT JOIN document_metadata dm ON dm.report_id = er.id

        ${fields.length > 0 ? 'WHERE' : ''} ${fields.join(' AND ')}

        GROUP BY er.id, u.id
        ORDER BY er.submitted_at DESC

        OFFSET $${index++}
        LIMIT $${index++}
    `
    
    // Execute the query
    try {
        const countResult = await pool.query(
            `
            SELECT COUNT(*)::int
            FROM expense_reports er
            ${fields.length > 0 ? 'WHERE' : ''} ${fields.join(' AND ')}
            `, values
        )
        
        values.push(offset, resultsPerPage + 1)
        const result = await pool.query(query, values)

        return {
            total: countResult.rows[0].count,
            results: result.rows.slice(0, resultsPerPage),
            next: (result.rowCount === resultsPerPage + 1)
        }
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Change the status of an expense report and add a comment if specified.
 * 
 * @param reportId The ID of the expense report to update
 * @param newStatus The new status to assign to the expense report
 * @param comment A comment that can be added by a manager when approving or denying a report
 * @throws NotFoundException or DatabaseException
 */
export async function processReport(reportId: number, newStatus: 'approved' | 'denied' | 'processed', comment?: string): Promise<void> {
    try {
        const result = await pool.query(
            `UPDATE expense_reports SET status = $2 ${comment ? ', comment = $3' : ''} WHERE id = $1`,
            comment ? [reportId, newStatus, comment] : [reportId, newStatus]
        )

        if (result.rowCount === 0) {
            throw new NotFoundException("Expense report")
        }
    } catch (error) {
        if (error instanceof ApiException) throw error
        throw new DatabaseException(error as Error)
    }
}

/**
 * Get the data and original file name from a specific document.
 * 
 * @param reportId The ID of the expense report tied to the document
 * @param documentId The UUID of the document to read
 * @returns An object containing a data Buffer and the file name (given during upload)
 * @throws NotFoundException or DatabaseException
 */
export async function getReportAttachment(reportId: number, documentId: string): Promise<AttachmentFile> {
    try {
        // Check the reportId/documentId pair and get the original file name
        const result = await pool.query(
            "SELECT original_name FROM document_metadata WHERE report_id = $1 AND id = $2",
            [reportId, documentId]
        )

        if (!result.rows[0]) throw new NotFoundException("Document")

        // Read the file from the data volume and return the AttachmentFile object
        const data = fs.readFileSync(`/data/${documentId}`)
        return {
            data,
            filename: result.rows[0].original_name
        }
    } catch (error) {
        if (error instanceof ApiException) throw error
        throw new DatabaseException(error as Error)
    }
}