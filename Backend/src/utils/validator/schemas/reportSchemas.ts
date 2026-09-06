import Joi from "joi";

export const reportUploadSchema = Joi.object({
    title: Joi.string().min(3).max(64).required(),
    description: Joi.string().max(300),
    amount: Joi.number().min(0).required()
})