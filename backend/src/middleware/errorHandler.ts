import type { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import AppLogger from "../utils/logger"
import { ApiError } from "../utils/apiError"

const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log the error
  AppLogger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Handle specific error types
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: "error",
      statusCode: err.statusCode,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
    return
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      status: "error",
      statusCode: 400,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
    return
  }

  // Handle sequelize errors
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    res.status(400).json({
      status: "error",
      statusCode: 400,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
    return
  }

  // Default to 500 server error
  res.status(500).json({
    status: "error",
    statusCode: 500,
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

export default errorHandler