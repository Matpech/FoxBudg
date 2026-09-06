import multer from "multer";
import { ApiException } from "../types/errors";
import { fileTypeFromFile } from "file-type";

/**
 * Common file upload middleware used throughout the application
 */
export const upload = multer({ dest: 'uploads/' })

/**
 * Validate an array of files uploaded through Multer.
 * 
 * This function throws a 400 "BAD REQUEST" if:
 * - No files are uploaded
 * - More than 5 files are uploaded
 * - One of the files is not a PDF document
 * 
 * @param files The array of files uploaded by the user
 * @throws ApiException
 */
export async function validateReportDocuments(files: Express.Multer.File[]) {
    // Accept bewteen 1 and 5 files
    if (!files || files.length === 0) {
        throw new ApiException(400, "NO_FILES_UPLOADED", "Please upload at least 1 PDF document")
    }

    if (files.length > 5) {
        throw new ApiException(400, "FILE_LIMIT_EXCEEDED", `Can only upload at most 5 PDF documents (${files.length} files uploaded)`)
    }

    // Ensure all files are PDF documents
    const paths = files.map(f => f.path)
    for (const path of paths) {
        const type = await fileTypeFromFile(path)
        if (type?.mime !== "application/pdf") {
            throw new ApiException(400, "INVALID_FILE_TYPE", "Only PDF documents are accepted")
        }
    }
}