import Joi from "joi";

export const userCreateSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    first_name: Joi.string().min(1).max(80).required(),
    last_name: Joi.string().min(1).max(80).required(),
    role: Joi.string().valid('employee', 'accountant', 'manager').default('employee')
})

export const userUpdateSchema = Joi.object({
    first_name: Joi.string().min(1).max(80),
    last_name: Joi.string().min(1).max(80),
    role: Joi.string().valid('employee', 'accountant', 'manager')
})