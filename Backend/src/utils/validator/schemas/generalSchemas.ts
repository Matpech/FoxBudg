import Joi from "joi";

export const numericIdSchema = Joi.number().min(1)