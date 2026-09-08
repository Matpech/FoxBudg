import Joi from "joi";

export const reportUploadSchema = Joi.object({
    title: Joi.string().min(3).max(64).required(),
    description: Joi.string().max(300),
    amount: Joi.number().min(0).required()
})

export const reportStatusSchema = Joi.string().valid('pending', 'approved', 'denied', 'processed')

export const reportSearchParamsSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    status: Joi.array().items(reportStatusSchema)
})

export const reportProcessingManagerSchema = Joi.object({
    newStatus: Joi.string().valid('approved', 'denied').required(),
    comment: Joi.string().max(300)
})