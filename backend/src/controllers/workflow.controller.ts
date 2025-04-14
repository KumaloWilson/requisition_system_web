import type { Request, Response, NextFunction } from "express"
import { ApprovalWorkflow } from "../models/approval-workflow.model"
import { Department } from "../models/department.model"
import { NotFoundError, BadRequestError } from "../utils/apiError"

// Get all approval workflows
export const getWorkflows = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workflows = await ApprovalWorkflow.findAll({
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
        workflows,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get workflow by ID
export const getWorkflowById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const workflow = await ApprovalWorkflow.findByPk(id, {
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
    })

    if (!workflow) {
      throw new NotFoundError("Approval workflow not found")
    }

    res.status(200).json({
      status: "success",
      data: {
        workflow,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Create a new approval workflow
export const createWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departmentId, categoryId, amountThreshold, approverSequence } = req.body

    // Check if department exists
    const department = await Department.findByPk(departmentId)
    if (!department) {
      throw new NotFoundError("Department not found")
    }

    // Validate approver sequence
    if (!approverSequence || !Array.isArray(approverSequence) || approverSequence.length === 0) {
      throw new BadRequestError("Approver sequence must be a non-empty array")
    }

    // Check if a workflow already exists for this department and category
    const existingWorkflow = await ApprovalWorkflow.findOne({
      where: {
        departmentId,
        categoryId,
      },
    })

    if (existingWorkflow) {
      throw new BadRequestError("An approval workflow already exists for this department and category")
    }

    // Create workflow
    const workflow = await ApprovalWorkflow.create({
      departmentId,
      categoryId,
      amountThreshold,
      approverSequence,
    })

    res.status(201).json({
      status: "success",
      message: "Approval workflow created successfully",
      data: {
        workflow,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Update an approval workflow
export const updateWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { departmentId, categoryId, amountThreshold, approverSequence } = req.body

    // Find workflow
    const workflow = await ApprovalWorkflow.findByPk(id)
    if (!workflow) {
      throw new NotFoundError("Approval workflow not found")
    }

    // Check if department exists
    if (departmentId) {
      const department = await Department.findByPk(departmentId)
      if (!department) {
        throw new NotFoundError("Department not found")
      }
    }

    // Validate approver sequence
    if (approverSequence) {
      if (!Array.isArray(approverSequence) || approverSequence.length === 0) {
        throw new BadRequestError("Approver sequence must be a non-empty array")
      }
    }

    // Check if a workflow already exists for this department and category
    if (departmentId && categoryId && (departmentId !== workflow.departmentId || categoryId !== workflow.categoryId)) {
      const existingWorkflow = await ApprovalWorkflow.findOne({
        where: {
          departmentId,
          categoryId,
        },
      })

      if (existingWorkflow) {
        throw new BadRequestError("An approval workflow already exists for this department and category")
      }
    }

    // Update workflow
    if (departmentId) workflow.departmentId = departmentId
    if (categoryId) workflow.categoryId = categoryId
    if (amountThreshold !== undefined) workflow.amountThreshold = amountThreshold
    if (approverSequence) workflow.approverSequence = approverSequence

    await workflow.save()

    res.status(200).json({
      status: "success",
      message: "Approval workflow updated successfully",
      data: {
        workflow,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Delete an approval workflow
export const deleteWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Find workflow
    const workflow = await ApprovalWorkflow.findByPk(id)
    if (!workflow) {
      throw new NotFoundError("Approval workflow not found")
    }

    // Delete workflow
    await workflow.destroy()

    res.status(200).json({
      status: "success",
      message: "Approval workflow deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}
