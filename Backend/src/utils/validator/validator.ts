import type { Request } from "express"
import type { Schema } from "joi"
import { ValidationException } from "../../types/errors"

/**
 * Validate input data from a Request against a Joi schema
 * 
 * @param req The Express Request object, used to inspect the request body
 * @param schema The Joi schema to use for validation
 * @returns The validated data
 * @throws ValidationException
 */
export default function validate<T>(
    req: Request,
    schema: Schema
): T {
    const body = req.body
    const result = schema.validate(body)

    if (result.error) {
        throw new ValidationException(result.error.message)
    }

    if (!result.value) {
        throw new ValidationException("No data")
    }

    return result.value
}