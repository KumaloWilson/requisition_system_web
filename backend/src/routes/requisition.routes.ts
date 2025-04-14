import { Router } from "express"
import { body, param } from "express-validator"
import { authenticate } from "../middleware/auth"
import { validateRequest } from "../middleware/validate"
import {
  createRequisition,
  getRequisitions,
  getRequisitionById,
  updateRequisition,
  deleteRequisition,
  submitRequisition,
  reviseRequisition,
  getRequisitionHistory,
} from "../controllers/requisition.controller"

const router = Router()

// Get all requisitions (with filters)
router.get("/", authenticate, getRequisitions)

// Get requisition by ID
router.get(
  "/:id",
  authenticate,
  [param("id").isUUID().withMessage("Invalid requisition ID")],
  validateRequest,
  getRequisitionById,
)

// Create a new requisition
router.post(
  "/",
  authenticate,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("departmentId").isUUID().withMessage("Invalid department ID"),
    body("amount").optional().isNumeric().withMessage("Amount must be a number"),
    body("category").notEmpty().withMessage("Category is required"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high"),
    body("dueDate").optional().isISO8601().withMessage("Due date must be a valid date"),
  ],
  validateRequest,
  createRequisition,
)

// Update a requisition
router.put(
  "/:id",
  authenticate,
  [
    param("id").isUUID().withMessage("Invalid requisition ID"),
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    body("amount").optional().isNumeric().withMessage("Amount must be a number"),
    body("category").optional().notEmpty().withMessage("Category cannot be empty"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high"),
    body("dueDate").optional().isISO8601().withMessage("Due date must be a valid date"),
  ],
  validateRequest,
  updateRequisition,
)

// Delete a requisition
router.delete(
  "/:id",
  authenticate,
  [param("id").isUUID().withMessage("Invalid requisition ID")],
  validateRequest,
  deleteRequisition,
)

// Submit a requisition for approval
router.post(
  "/:id/submit",
  authenticate,
  [param("id").isUUID().withMessage("Invalid requisition ID")],
  validateRequest,
  submitRequisition,
)

// Revise a rejected requisition
router.post(
  "/:id/revise",
  authenticate,
  [
    param("id").isUUID().withMessage("Invalid requisition ID"),
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    body("amount").optional().isNumeric().withMessage("Amount must be a number"),
    body("category").optional().notEmpty().withMessage("Category cannot be empty"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high"),
    body("dueDate").optional().isISO8601().withMessage("Due date must be a valid date"),
  ],
  validateRequest,
  reviseRequisition,
)

// Get requisition history (all revisions)
router.get(
  "/:id/history",
  authenticate,
  [param("id").isUUID().withMessage("Invalid requisition ID")],
  validateRequest,
  getRequisitionHistory,
)

export default router
