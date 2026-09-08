import type { Request } from "express"
import type { Schema } from "joi"
import { ValidationException } from "../../types/errors"

/**
 * Validate input data from a Request against a Joi schema
 * 
 * @param req The Express Request object, used to inspect the request body
 * @param schema The Joi schema to use for validation
 * @param bodyOptional Set to true to allow empty request bodies
 * @returns The validated data
 * @throws ValidationException
 */
export default function validate<T>(
    req: Request,
    schema: Schema,
    bodyOptional = false
): T {
    const body = req.body
    const result = schema.validate(body)

    if (result.error) {
        throw new ValidationException(result.error.message)
    }

    if (!result.value) {
        if (!bodyOptional) throw new ValidationException("No data")
        return undefined as T
    }

    return result.value
}