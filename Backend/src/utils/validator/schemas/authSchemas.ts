import Joi from "joi";

/**
 * Validation schema used to validate login credentials from a request body
 */
export const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().min(8).required()
})