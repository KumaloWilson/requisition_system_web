import type { Request, Response, NextFunction } from "express"
import { Requisition } from "../models/requisition.model"
import { Approval } from "../models/approval.model"
import { ApprovalWorkflow } from "../models/approval-workflow.model"
import { User } from "../models/user.model"
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/apiError"
import { sendNotification } from "../services/notification.service"

// Get all pending approvals for the current user
export const getPendingApprovals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id

    // Get user's authority level
    const user = await User.findByPk(userId)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Find all pending approvals for this user
    const pendingApprovals = await Approval.findAll({
      where: {
        approverId: userId,
        status: "pending",
      },
      include: [
        {
          model: Requisition,
          where: {
            currentApproverLevel: user.authorityLevel,
          },
          include: [
            {
              model: User,
              as: "requestor",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
    })

    res.status(200).json({
      status: "success",
      data: {
        pendingApprovals,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Approve a requisition
export const approveRequisition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { comment } = req.body
    const userId = req.user?.id

    // Get user's authority level
    const user = await User.findByPk(userId)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Find requisition
    const requisition = await Requisition.findByPk(id)
    if (!requisition) {
      throw new NotFoundError("Requisition not found")
    }

    // Check if requisition is pending approval
    if (requisition.status !== "pending" && requisition.status !== "partially_approved") {
      throw new BadRequestError("This requisition is not pending approval")
    }

    // Check if the current approver level matches the user's authority level
    if (requisition.currentApproverLevel !== user.authorityLevel) {
      throw new ForbiddenError("You are not authorized to approve this requisition at this stage")
    }

    // Find the approval record
    const approval = await Approval.findOne({
      where: {
        requisitionId: id,
        approverId: userId,
        status: "pending",
      },
    })

    if (!approval) {
      throw new NotFoundError("Approval record not found")
    }

    // Update approval status
    approval.status = "approved"
    approval.comment = comment
    await approval.save()

    // Find the approval workflow
    const workflow = await ApprovalWorkflow.findOne({
      where: {
        departmentId: requisition.departmentId,
        categoryId: requisition.category,
      },
    })

    if (!workflow) {
      throw new BadRequestError("No approval workflow found for this requisition")
    }

    // Parse approver sequence
    const approverSequence = workflow.approverSequence

    // Check if this is the highest authority approver
    const isHighestAuthority = user.authorityLevel === Math.max(...approverSequence)

    // If highest authority approves, automatically approve the requisition
    if (isHighestAuthority) {
      requisition.status = "approved"
      await requisition.save()

      // Notify requestor
      const requestor = await User.findByPk(requisition.requestorId)
      if (requestor) {
        await sendNotification(
          requestor.email,
          "Requisition Approved",
          `Your requisition "${requisition.title}" has been approved.`,
        )
      }

      res.status(200).json({
        status: "success",
        message: "Requisition approved successfully",
        data: {
          requisition,
        },
      })
      return
    }

    // Check if all approvers at the current level have approved
    const approversAtCurrentLevel = await User.findAll({
      where: {
        role: "approver",
        authorityLevel: requisition.currentApproverLevel,
      },
    })

    const approvalsAtCurrentLevel = await Approval.findAll({
      where: {
        requisitionId: id,
        approverLevel: requisition.currentApproverLevel,
      },
    })

    const allApproved = approvalsAtCurrentLevel.every((a) => a.status === "approved")

    if (allApproved) {
      // Find the next approver level
      const currentLevelIndex = approverSequence.indexOf(requisition.currentApproverLevel)
      const nextLevel = approverSequence[currentLevelIndex + 1]

      if (nextLevel) {
        // Move to the next approver level
        requisition.status = "partially_approved"
        requisition.currentApproverLevel = nextLevel
        await requisition.save()

        // Create approval records for the next level approvers
        const nextLevelApprovers = await User.findAll({
          where: {
            role: "approver",
            authorityLevel: nextLevel,
          },
        })

        for (const approver of nextLevelApprovers) {
          await Approval.create({
            requisitionId: requisition.id,
            approverId: approver.id,
            status: "pending",
            approverLevel: nextLevel,
          })

          // Send notification to next level approvers
          await sendNotification(
            approver.email,
            "New Requisition for Approval",
            `A requisition "${requisition.title}" requires your approval.`,
          )
        }
      } else {
        // All levels have approved
        requisition.status = "approved"
        await requisition.save()

        // Notify requestor
        const requestor = await User.findByPk(requisition.requestorId)
        if (requestor) {
          await sendNotification(
            requestor.email,
            "Requisition Approved",
            `Your requisition "${requisition.title}" has been approved.`,
          )
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Requisition approved successfully",
      data: {
        requisition,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Reject a requisition
export const rejectRequisition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { comment } = req.body
    const userId = req.user?.id

    // Validate comment
    if (!comment) {
      throw new BadRequestError("Rejection reason is required")
    }

    // Get user's authority level
    const user = await User.findByPk(userId)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Find requisition
    const requisition = await Requisition.findByPk(id)
    if (!requisition) {
      throw new NotFoundError("Requisition not found")
    }

    // Check if requisition is pending approval
    if (requisition.status !== "pending" && requisition.status !== "partially_approved") {
      throw new BadRequestError("This requisition is not pending approval")
    }

    // Check if the current approver level matches the user's authority level
    if (requisition.currentApproverLevel !== user.authorityLevel) {
      throw new ForbiddenError("You are not authorized to reject this requisition at this stage")
    }

    // Find the approval record
    const approval = await Approval.findOne({
      where: {
        requisitionId: id,
        approverId: userId,
        status: "pending",
      },
    })

    if (!approval) {
      throw new NotFoundError("Approval record not found")
    }

    // Update approval status
    approval.status = "rejected"
    approval.comment = comment
    await approval.save()

    // Update requisition status
    requisition.status = "rejected"
    await requisition.save()

    // Notify requestor
    const requestor = await User.findByPk(requisition.requestorId)
    if (requestor) {
      await sendNotification(
        requestor.email,
        "Requisition Rejected",
        `Your requisition "${requisition.title}" has been rejected. Reason: ${comment}`,
      )
    }

    res.status(200).json({
      status: "success",
      message: "Requisition rejected successfully",
      data: {
        requisition,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get approval history for a requisition
export const getApprovalHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user?.id
    const userRole = req.user?.role

    // Find requisition
    const requisition = await Requisition.findByPk(id)
    if (!requisition) {
      throw new NotFoundError("Requisition not found")
    }

    // Check if user has permission to view this requisition
    if (userRole === "regular_user" && requisition.requestorId !== userId) {
      throw new ForbiddenError("You do not have permission to view this requisition")
    }

    // Get all approvals for this requisition
    const approvals = await Approval.findAll({
      where: {
        requisitionId: id,
      },
      include: [
        {
          model: User,
          as: "approver",
          attributes: ["id", "firstName", "lastName", "email", "authorityLevel"],
        },
      ],
      order: [
        ["approverLevel", "ASC"],
        ["createdAt", "ASC"],
      ],
    })

    res.status(200).json({
      status: "success",
      data: {
        approvals,
      },
    })
  } catch (error) {
    next(error)
  }
}
