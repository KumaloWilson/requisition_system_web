import type { Request, Response, NextFunction } from "express"
import { Op } from "sequelize"
import { Requisition } from "../models/requisition.model"
import { Approval } from "../models/approval.model"
import { ApprovalWorkflow } from "../models/approval-workflow.model"
import { User } from "../models/user.model"
import { Attachment } from "../models/attachment.model"
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/apiError"
import { sendNotification } from "../services/notification.service"

// Get all requisitions with filtering
export const getRequisitions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority, category, departmentId, startDate, endDate, search } = req.query

    const userId = req.user?.id
    const userRole = req.user?.role

    // Build filter conditions
    const whereClause: any = {}

    // Filter by status
    if (status) {
      whereClause.status = status
    }

    // Filter by priority
    if (priority) {
      whereClause.priority = priority
    }

    // Filter by category
    if (category) {
      whereClause.category = category
    }

    // Filter by department
    if (departmentId) {
      whereClause.departmentId = departmentId
    }

    // Filter by date range
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      }
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate as string),
      }
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(endDate as string),
      }
    }

    // Search by title or description
    if (search) {
      whereClause[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }, { description: { [Op.iLike]: `%${search}%` } }]
    }

    // Regular users can only see their own requisitions
    if (userRole === "regular_user") {
      whereClause.requestorId = userId
    }

    // Approvers can see requisitions they need to approve
    if (userRole === "approver") {
      // Get the authority level of the approver
      const approver = await User.findByPk(userId)
      if (!approver) {
        throw new NotFoundError("User not found")
      }

      const authorityLevel = approver.authorityLevel

      // Find requisitions where the current approver level matches the user's authority level
      const requisitionsToApprove = await Requisition.findAll({
        where: {
          status: ["pending", "partially_approved"],
          currentApproverLevel: authorityLevel,
        },
      })

      const requisitionIdsToApprove = requisitionsToApprove.map((req) => req.id)

      // Combine with user's own requisitions
      whereClause[Op.or] = [{ requestorId: userId }, { id: { [Op.in]: requisitionIdsToApprove } }]
    }

    // Get requisitions with pagination
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    const requisitions = await Requisition.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "requestor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Approval,
          include: [
            {
              model: User,
              as: "approver",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    })

    // Calculate pagination info
    const totalPages = Math.ceil(requisitions.count / limit)

    res.status(200).json({
      status: "success",
      data: {
        requisitions: requisitions.rows,
        pagination: {
          total: requisitions.count,
          page,
          limit,
          totalPages,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get requisition by ID
export const getRequisitionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const userRole = req.user?.role

    // Find requisition with approvals and attachments
    const requisition = await Requisition.findByPk(id, {
      include: [
        {
          model: User,
          as: "requestor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Approval,
          include: [
            {
              model: User,
              as: "approver",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
        {
          model: Attachment,
        },
      ],
    })

    if (!requisition) {
      throw new NotFoundError("Requisition not found")
    }

    // Check if user has permission to view this requisition
    if (userRole === "regular_user" && requisition.requestorId !== userId) {
      throw new ForbiddenError("You do not have permission to view this requisition")
    }

    res.status(200).json({
      status: "success",
      data: {
        requisition,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Create a new requisition
export const createRequisition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, departmentId, amount, category, priority, dueDate } = req.body

    const userId = req.user?.id

    // Create requisition
    const requisition = await Requisition.create({
      title,
      description,
      requestorId: userId,
      departmentId,
      amount,
      category,
      priority,
      dueDate,
      status: "draft",
    })

    res.status(201).json({
      status: "success",
      message: "Requisition created successfully",
      data: {
        requisition,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Update a requisition
export const updateRequisition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { title, description, amount, category, priority, dueDate } = req.body

    const userId = req.user?.id

    // Find requisition
    const requisition = await Requisition.findByPk(id)

    if (!requisition) {
      throw new NotFoundError("Requisition not found")
    }

    // Check if user is the owner of the requisition
    if (requisition.requestorId !== userId) {
      throw new ForbiddenError("You do not have permission to update this requisition")
    }

    // Check if requisition is in draft or rejected status
    if (requisition.status !== "draft" && requisition.status !== "rejected") {
      throw new BadRequestError("Only draft or rejected requisitions can be updated")
    }

    // Update requisition
    if (title) requisition.title = title
    if (description) requisition.description = description
    if (amount) requisition.amount = amount
    if (category) requisition.category = category
    if (priority) requisition.priority = priority
    if (dueDate) requisition.dueDate = dueDate

    await requisition.save()

    res.status(200).json({
      status: "success",
      message: "Requisition updated successfully",
      data: {
        requisition,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Delete a requisition
export const deleteRequisition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const userRole = req.user?.role

    // Find requisition
    const requisition = await Requisition.findByPk(id)

    if (!requisition) {
      throw new NotFoundError("Requisition not found")
    }

    // Check if user is the owner of the requisition or an admin
    if (requisition.requestorId !== userId && userRole !== "admin") {
      throw new ForbiddenError("You do not have permission to delete this requisition")
    }

    // Check if requisition is in draft status
    if (requisition.status !== "draft") {
      throw new BadRequestError("Only draft requisitions can be deleted")
    }

    // Delete requisition
    await requisition.destroy()

    res.status(200).json({
      status: "success",
      message: "Requisition deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// Submit a requisition for approval
export const submitRequisition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    // Find requisition
    const requisition = await Requisition.findByPk(id)

    if (!requisition) {
      throw new NotFoundError("Requisition not found")
    }

    // Check if user is the owner of the requisition
    if (requisition.requestorId !== userId) {
      throw new ForbiddenError("You do not have permission to submit this requisition")
    }

    // Check if requisition is in draft or revised status
    if (requisition.status !== "draft" && requisition.status !== "revised") {
      throw new BadRequestError("Only draft or revised requisitions can be submitted")
    }

    // Find the appropriate approval workflow
    const workflow = await ApprovalWorkflow.findOne({
      where: {
        departmentId: requisition.departmentId,
        categoryId: requisition.category,
        amountThreshold: {
          [Op.gte]: requisition.amount || 0,
        },
      },
      order: [["amountThreshold", "ASC"]],
    })

    if (!workflow) {
      throw new BadRequestError("No approval workflow found for this requisition")
    }

    // Parse approver sequence
    const approverSequence = workflow.approverSequence

    // Set the first approver level
    const firstApproverLevel = approverSequence[0]

    // Update requisition status
    requisition.status = "pending"
    requisition.currentApproverLevel = firstApproverLevel
    await requisition.save()

    // Find approvers with the required authority level
    const approvers = await User.findAll({
      where: {
        role: "approver",
        authorityLevel: firstApproverLevel,
      },
    })

    // Create approval records for each approver
    for (const approver of approvers) {
      await Approval.create({
        requisitionId: requisition.id,
        approverId: approver.id,
        status: "pending",
        approverLevel: firstApproverLevel,
      })

      // Send notification to approver
      await sendNotification(
        approver.email,
        "New Requisition for Approval",
        `A new requisition "${requisition.title}" requires your approval.`,
      )
    }

    res.status(200).json({
      status: "success",
      message: "Requisition submitted for approval",
      data: {
        requisition,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Revise a rejected requisition
export const reviseRequisition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { title, description, amount, category, priority, dueDate } = req.body

    const userId = req.user?.id

    // Find requisition
    const requisition = await Requisition.findByPk(id)

    if (!requisition) {
      throw new NotFoundError("Requisition not found")
    }

    // Check if user is the owner of the requisition
    if (requisition.requestorId !== userId) {
      throw new ForbiddenError("You do not have permission to revise this requisition")
    }

    // Check if requisition is in rejected status
    if (requisition.status !== "rejected") {
      throw new BadRequestError("Only rejected requisitions can be revised")
    }

    // Create a new revision
    const newRequisition = await Requisition.create({
      title: title || requisition.title,
      description: description || requisition.description,
      requestorId: userId,
      departmentId: requisition.departmentId,
      amount: amount || requisition.amount,
      category: category || requisition.category,
      priority: priority || requisition.priority,
      dueDate: dueDate || requisition.dueDate,
      status: "revised",
      revisionNumber: requisition.revisionNumber + 1,
      originalRequisitionId: requisition.originalRequisitionId || requisition.id,
    })

    res.status(201).json({
      status: "success",
      message: "Requisition revised successfully",
      data: {
        requisition: newRequisition,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get requisition history (all revisions)
export const getRequisitionHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const userRole = req.user?.role

    // Find original requisition
    const originalRequisition = await Requisition.findByPk(id)

    if (!originalRequisition) {
      throw new NotFoundError("Requisition not found")
    }

    // Check if user has permission to view this requisition
    if (userRole === "regular_user" && originalRequisition.requestorId !== userId) {
      throw new ForbiddenError("You do not have permission to view this requisition")
    }

    // Find all revisions
    const originalId = originalRequisition.originalRequisitionId || originalRequisition.id

    const revisions = await Requisition.findAll({
      where: {
        [Op.or]: [{ id: originalId }, { originalRequisitionId: originalId }],
      },
      include: [
        {
          model: User,
          as: "requestor",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Approval,
          include: [
            {
              model: User,
              as: "approver",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
      order: [["revisionNumber", "ASC"]],
    })

    res.status(200).json({
      status: "success",
      data: {
        revisions,
      },
    })
  } catch (error) {
    next(error)
  }
}
