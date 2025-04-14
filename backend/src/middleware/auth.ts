import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { UnauthorizedError, ForbiddenError } from "../utils/apiError"
import { User } from "../models/user.model"

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

// Verify JWT token
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token

    if (!token) {
      throw new UnauthorizedError("Authentication required")
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      id: string
    }

    // Find user
    const user = await User.findByPk(decoded.id)
    if (!user) {
      throw new UnauthorizedError("User not found")
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid token"))
    } else {
      next(error)
    }
  }
}

// Check user role
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"))
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("You do not have permission to perform this action"))
    }

    next()
  }
}
