import type { Request, Response, NextFunction } from "express"
import { User } from "../models/user.model"
import { BadRequestError, UnauthorizedError } from "../utils/apiError"
import jwt from "jsonwebtoken"

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || "your-secret-key";
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  } as jwt.SignOptions)
}

// Generate refresh token
const generateRefreshToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || "refresh-secret", {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  } as jwt.SignOptions)
}

// Register a new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, departmentId } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      throw new BadRequestError("User with this email already exists")
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      departmentId,
      role: "regular_user",
      authorityLevel: 0,
    })

    // Generate tokens
    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Return user data (without password)
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    }

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: userData,
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ where: { email } })
    if (!user) {
      throw new UnauthorizedError("Invalid credentials")
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials")
    }

    // Generate tokens
    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Return user data (without password)
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    }

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: userData,
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Logout user
export const logout = (req: Request, res: Response) => {
  // Clear cookies
  res.clearCookie("token")
  res.clearCookie("refreshToken")

  res.status(200).json({
    status: "success",
    message: "Logout successful",
  })
}

// Refresh token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token not found")
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refresh-secret") as { id: string }

    // Find user
    const user = await User.findByPk(decoded.id)
    if (!user) {
      throw new UnauthorizedError("User not found")
    }

    // Generate new tokens
    const token = generateToken(user.id)
    const newRefreshToken = generateRefreshToken(user.id)

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      data: {
        token,
      },
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid refresh token"))
    } else {
      next(error)
    }
  }
}

// Get user profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user

    // Return user data (without password)
    const userData = {
      id: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      role: user?.role,
      departmentId: user?.departmentId,
      authorityLevel: user?.authorityLevel,
    }

    res.status(200).json({
      status: "success",
      data: {
        user: userData,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Update user profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password } = req.body
    const userId = req.user?.id

    // Find user
    const user = await User.findByPk(userId)
    if (!user) {
      throw new UnauthorizedError("User not found")
    }

    // Update user data
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email) user.email = email
    if (password) user.password = password

    await user.save()

    // Return updated user data (without password)
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    }

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        user: userData,
      },
    })
  } catch (error) {
    next(error)
  }
}
