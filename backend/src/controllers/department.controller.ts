import type { Request, Response, NextFunction } from "express"
import { Department } from "../models/department.model"
import { NotFoundError, ConflictError } from "../utils/apiError"

// Get all departments
export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await Department.findAll()

    res.status(200).json({
      status: "success",
      data: {
        departments,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get department by ID
export const getDepartmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const department = await Department.findByPk(id)
    if (!department) {
      throw new NotFoundError("Department not found")
    }

    res.status(200).json({
      status: "success",
      data: {
        department,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Create a new department
export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body

    // Check if department already exists
    const existingDepartment = await Department.findOne({ where: { name } })
    if (existingDepartment) {
      throw new ConflictError("Department with this name already exists")
    }

    // Create department
    const department = await Department.create({
      name,
      description,
    })

    res.status(201).json({
      status: "success",
      message: "Department created successfully",
      data: {
        department,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Update a department
export const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    // Find department
    const department = await Department.findByPk(id)
    if (!department) {
      throw new NotFoundError("Department not found")
    }

    // Check if name is already taken by another department
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ where: { name } })
      if (existingDepartment) {
        throw new ConflictError("Department with this name already exists")
      }
    }

    // Update department
    if (name) department.name = name
    if (description !== undefined) department.description = description

    await department.save()

    res.status(200).json({
      status: "success",
      message: "Department updated successfully",
      data: {
        department,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Delete a department
export const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Find department
    const department = await Department.findByPk(id)
    if (!department) {
      throw new NotFoundError("Department not found")
    }

    // Delete department
    await department.destroy()

    res.status(200).json({
      status: "success",
      message: "Department deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}
