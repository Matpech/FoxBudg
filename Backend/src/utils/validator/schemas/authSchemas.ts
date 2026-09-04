import Joi from "joi";

// Reusable single value schemas for email/password requirements and other values
export const emailSchema = Joi.string().email({ minDomainSegments: 2 })
export const passwordSchema = Joi.string().min(8)
export const sessionIdValue = Joi.string().hex().length(64)

/**
 * Validation schema used to validate login credentials from a request body
 * 
 * This schema accepts an optional `newPassword` field for when the user is asked to change his password during login
 */
export const loginSchema = Joi.object({
    email: emailSchema.required(),
    password: passwordSchema.required(),
    newPassword: passwordSchema
})
