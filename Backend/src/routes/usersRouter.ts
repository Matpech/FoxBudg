import { Router } from "express";
import { authenticated, roleRequired } from "../middlewares/authMiddlewares";
import { ApiException, InvalidIdException, InvalidTokenException } from "../types/errors";
import validate from "../utils/validator/validator";
import { userCreateSchema, userUpdateSchema } from "../utils/validator/schemas/userSchemas";
import type { UserCreateParams, UserUpdateParams } from "../types/users";
import { createUserAccount, deleteUser, getOneUser, getUserReportStats, getUsers, updateUser } from "../repositories/usersRepo";
import { numericIdSchema } from "../utils/validator/schemas/generalSchemas";

const router = Router()

router.post('/', roleRequired('manager'), async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const userDetails = validate<UserCreateParams>(req, userCreateSchema)

    // Double check the role in the database
    const account = await getOneUser(req.user.id)
    if (account.role !== 'manager') throw new ApiException(403, "ACCESS_DENIED", "You do not have permission to perform this action")

    const info = await createUserAccount(userDetails)
    return res.status(201).json(info)
})

router.get('/', roleRequired('manager'), async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const account = await getOneUser(req.user.id)
    if (account.role !== 'manager') throw new ApiException(403, "ACCESS_DENIED", "You do not have permission to perform this action")

    const accounts = await getUsers()
    return res.json(accounts)
})

router.get('/:user_id', authenticated, async (req, res) => {
    const validationResult = numericIdSchema.validate(parseInt(req.params.user_id as string))
    const userId = validationResult.value
    if (!userId) {
        throw new InvalidIdException()
    }
    
    const account = await getOneUser(userId)
    return res.json(account)
})

router.patch('/:user_id', roleRequired('manager'), async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }
    
    const validationResult = numericIdSchema.validate(parseInt(req.params.user_id as string))
    const userId = validationResult.value
    if (!userId) {
        throw new InvalidIdException()
    }
    const newDetails = validate<UserUpdateParams>(req, userUpdateSchema)

    const account = await getOneUser(req.user.id)
    if (account.role !== 'manager') throw new ApiException(403, "ACCESS_DENIED", "You do not have permission to perform this action")

    const updatedUser = await updateUser(userId, newDetails, req.user.id === userId)
    return res.json(updatedUser)
})

router.delete('/:user_id', roleRequired('manager'), async (req, res) => {
    if (!req.user) {
        throw new InvalidTokenException()
    }

    const validationResult = numericIdSchema.validate(parseInt(req.params.user_id as string))
    const userId = validationResult.value
    if (!userId) {
        throw new InvalidIdException()
    }

    const account = await getOneUser(req.user.id)
    if (account.role !== 'manager') throw new ApiException(403, "ACCESS_DENIED", "You do not have permission to perform this action")

    await deleteUser(userId)
    return res.sendStatus(204)
})

router.get('/:user_id/stats', authenticated, async (req, res) => {
    const validationResult = numericIdSchema.validate(parseInt(req.params.user_id as string))
    const userId = validationResult.value
    if (!userId) {
        throw new InvalidIdException()
    }

    const stats = await getUserReportStats(userId)
    return res.json(stats)
})

export default router