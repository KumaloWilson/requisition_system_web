import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import { BadRequestError } from "../utils/apiError"

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error,
      message: error.msg,
    }))

    throw new BadRequestError(JSON.stringify(errorMessages))
  }
  next()
}
