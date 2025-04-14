import { Router } from "express"
import { body, param } from "express-validator"
import { authenticate, authorize } from "../middleware/auth"
import { validateRequest } from "../middleware/validate"
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from "../controllers/workflow.controller"

const router = Router()

// Get all approval workflows
router.get("/", authenticate, authorize("admin"), getWorkflows)

// Get workflow by ID
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  [param("id").isUUID().withMessage("Invalid workflow ID")],
  validateRequest,
  getWorkflowById,
)

// Create a new approval workflow
router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("departmentId").isUUID().withMessage("Invalid department ID"),
    body("categoryId").notEmpty().withMessage("Category ID is required"),
    body("amountThreshold").optional().isNumeric().withMessage("Amount threshold must be a number"),
    body("approverSequence").isArray().withMessage("Approver sequence must be an array"),
  ],
  validateRequest,
  createWorkflow,
)

// Update an approval workflow
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  [
    param("id").isUUID().withMessage("Invalid workflow ID"),
    body("departmentId").optional().isUUID().withMessage("Invalid department ID"),
    body("categoryId").optional().notEmpty().withMessage("Category ID cannot be empty"),
    body("amountThreshold").optional().isNumeric().withMessage("Amount threshold must be a number"),
    body("approverSequence").optional().isArray().withMessage("Approver sequence must be an array"),
  ],
  validateRequest,
  updateWorkflow,
)

// Delete an approval workflow
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  [param("id").isUUID().withMessage("Invalid workflow ID")],
  validateRequest,
  deleteWorkflow,
)

export default router
