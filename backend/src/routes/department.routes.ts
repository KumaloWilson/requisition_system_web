import { Router } from "express"
import { body, param } from "express-validator"
import { authenticate, authorize } from "../middleware/auth"
import { validateRequest } from "../middleware/validate"
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller"

const router = Router()

// Get all departments
router.get("/", authenticate, getDepartments)

// Get department by ID
router.get(
  "/:id",
  authenticate,
  [param("id").isUUID().withMessage("Invalid department ID")],
  validateRequest,
  getDepartmentById,
)

// Create a new department (admin only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("name").notEmpty().withMessage("Department name is required"),
    body("description").optional().isString().withMessage("Description must be a string"),
  ],
  validateRequest,
  createDepartment,
)

// Update a department
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  [
    param("id").isUUID().withMessage("Invalid department ID"),
    body("name").optional().notEmpty().withMessage("Department name cannot be empty"),
    body("description").optional().isString().withMessage("Description must be a string"),
  ],
  validateRequest,
  updateDepartment,
)

// Delete a department
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  [param("id").isUUID().withMessage("Invalid department ID")],
  validateRequest,
  deleteDepartment,
)

export default router
