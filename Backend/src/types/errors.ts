/**
 * Base class for all API related errors that should return an HTTP error.
 * 
 * @param statusCode the HTTP response code to return to the client
 * @param code an error code that defines the error type (example: "NOT_FOUND")
 * @param message an error message aimed towards the user (example: "Resource was not found")
 * @param cause optional parameter that accepts the error that caused the ApiException, for debugging purposes
 */
export class ApiException extends Error {
    public readonly statusCode: number
    public readonly code: string

    constructor(
        statusCode: number,
        code: string,
        message: string,
        cause?: unknown
    ) {
        super(message, { cause })

        this.name = "ApiException"
        this.statusCode = statusCode
        this.code = code
    }
}

/**
 * Custom ApiException type related to database errors
 * 
 * @param error The error returned by pg, this error is set as the "cause" parameter for ApiException and is used for debugging purposes
 * @returns HTTP 500 `DATABASE_ERROR`
 */
export class DatabaseException extends ApiException {
    constructor(error: Error) {
        super(500, "DATABASE_ERROR", "An error occured while accessing the database", error)
    }
}

/**
 * Custom ApiException type related to validation errors (invalid URL parameters or request body)
 * 
 * @param message The error message to return to the client (indicating what caused the validation to fail)
 * @returns HTTP 400 `VALIDATION_ERROR`
 */
export class ValidationException extends ApiException {
    constructor(message: string) {
        super(400, "VALIDATION_ERROR", message)
    }
}

/**
 * Custom ApiException type related to JWT errors (invalid JWT, invalid signature, expired JWT)
 * 
 * @returns HTTP 401 `INVALID_TOKEN`
 */
export class InvalidTokenException extends ApiException {
    constructor() {
        super(401, "INVALID_TOKEN", "Your token is invalid or has expired")
    }
}

/**
 * Custom ApiException type related to session errors (invalid or expired session)
 * 
 * @returns HTTP 401 `INVALID_SESSION`
 */
export class InvalidSessionException extends ApiException {
    constructor() {
        super(401, "INVALID_SESSION", "Your session ID is invalid or has expired")
    }
}

/**
 * Custom ApiException type used when a resource cannot be found in the database
 * 
 * @param resourceName the name of the resource (optional)
 * @returns HTTP 404 `NOT_FOUND`
 */
export class NotFoundException extends ApiException {
    constructor(resourceName = "Resource") {
        super(404, "NOT_FOUND", `${resourceName} was not found`)
    }
}

/**
 * Custom ApiException type used during development for features that are not fully implemented
 * 
 * Should not be encountered in the frontend (in theory)
 * 
 * @returns HTTP 501 `NOT_IMPLEMENTED`
 */
export class NotImplementedException extends ApiException {
    constructor() {
        super(501, "NOT_IMPLEMENTED", "This feature has not been implemented yet")
    }
}