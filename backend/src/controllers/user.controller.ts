import type { Request, Response, NextFunction } from "express"
import { User } from "../models/user.model"
import { Department } from "../models/department.model"
import { NotFoundError, ConflictError, BadRequestError } from "../utils/apiError"

// Get all users
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
    })

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get user by ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
    })

    if (!user) {
      throw new NotFoundError("User not found")
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Create a new user
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, role, authorityLevel, departmentId } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      throw new ConflictError("User with this email already exists")
    }

    // Check if department exists
    if (departmentId) {
      const department = await Department.findByPk(departmentId)
      if (!department) {
        throw new NotFoundError("Department not found")
      }
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      authorityLevel: authorityLevel || (role === "approver" ? 1 : 0),
      departmentId,
    })

    // Return user data (without password)
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      authorityLevel: user.authorityLevel,
      departmentId: user.departmentId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        user: userData,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Update a user
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { firstName, lastName, email, departmentId } = req.body

    // Find user
    const user = await User.findByPk(id)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        throw new ConflictError("User with this email already exists")
      }
    }

    // Check if department exists
    if (departmentId) {
      const department = await Department.findByPk(departmentId)
      if (!department) {
        throw new NotFoundError("Department not found")
      }
    }

    // Update user
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email) user.email = email
    if (departmentId) user.departmentId = departmentId

    await user.save()

    // Return user data (without password)
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      authorityLevel: user.authorityLevel,
      departmentId: user.departmentId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: {
        user: userData,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Delete a user
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Find user
    const user = await User.findByPk(id)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Delete user
    await user.destroy()

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// Update user role and authority level
export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { role, authorityLevel } = req.body

    // Find user
    const user = await User.findByPk(id)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Validate authority level for approvers
    if (role === "approver" && (!authorityLevel || authorityLevel < 1)) {
      throw new BadRequestError("Approvers must have an authority level of at least 1")
    }

    // Update user role and authority level
    user.role = role
    user.authorityLevel = authorityLevel || (role === "approver" ? 1 : 0)

    await user.save()

    // Return user data (without password)
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      authorityLevel: user.authorityLevel,
      departmentId: user.departmentId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    res.status(200).json({
      status: "success",
      message: "User role updated successfully",
      data: {
        user: userData,
      },
    })
  } catch (error) {
    next(error)
  }
}
