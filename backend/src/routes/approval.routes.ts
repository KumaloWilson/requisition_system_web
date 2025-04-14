import { Router } from "express"
import { body, param } from "express-validator"
import { authenticate, authorize } from "../middleware/auth"
import { validateRequest } from "../middleware/validate"
import {
  getPendingApprovals,
  approveRequisition,
  rejectRequisition,
  getApprovalHistory,
} from "../controllers/approval.controller"

const router = Router()

// Get all pending approvals for the current user
router.get("/pending", authenticate, authorize("approver", "admin"), getPendingApprovals)

// Approve a requisition
router.post(
  "/:id/approve",
  authenticate,
  authorize("approver", "admin"),
  [
    param("id").isUUID().withMessage("Invalid requisition ID"),
    body("comment").optional().isString().withMessage("Comment must be a string"),
  ],
  validateRequest,
  approveRequisition,
)

// Reject a requisition
router.post(
  "/:id/reject",
  authenticate,
  authorize("approver", "admin"),
  [
    param("id").isUUID().withMessage("Invalid requisition ID"),
    body("comment").notEmpty().withMessage("Rejection reason is required"),
  ],
  validateRequest,
  rejectRequisition,
)

// Get approval history for a requisition
router.get(
  "/:id/history",
  authenticate,
  [param("id").isUUID().withMessage("Invalid requisition ID")],
  validateRequest,
  getApprovalHistory,
)

export default router
