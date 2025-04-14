export class ApiError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(400, message)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message)
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message)
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(409, message)
  }
}
