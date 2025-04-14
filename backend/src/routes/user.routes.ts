import { Router } from "express"
import { body, param } from "express-validator"
import { authenticate, authorize } from "../middleware/auth"
import { validateRequest } from "../middleware/validate"
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
} from "../controllers/user.controller"

const router = Router()

// Get all users
router.get("/", authenticate, authorize("admin"), getUsers)

// Get user by ID
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  [param("id").isUUID().withMessage("Invalid user ID")],
  validateRequest,
  getUserById,
)

// Create a new user (admin only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    body("role")
      .isIn(["regular_user", "approver", "admin"])
      .withMessage("Role must be regular_user, approver, or admin"),
    body("authorityLevel").optional().isInt({ min: 0 }).withMessage("Authority level must be a non-negative integer"),
    body("departmentId").optional().isUUID().withMessage("Invalid department ID"),
  ],
  validateRequest,
  createUser,
)

// Update a user
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  [
    param("id").isUUID().withMessage("Invalid user ID"),
    body("firstName").optional().notEmpty().withMessage("First name cannot be empty"),
    body("lastName").optional().notEmpty().withMessage("Last name cannot be empty"),
    body("email").optional().isEmail().withMessage("Please provide a valid email"),
    body("departmentId").optional().isUUID().withMessage("Invalid department ID"),
  ],
  validateRequest,
  updateUser,
)

// Delete a user
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  [param("id").isUUID().withMessage("Invalid user ID")],
  validateRequest,
  deleteUser,
)

// Update user role and authority level
router.put(
  "/:id/role",
  authenticate,
  authorize("admin"),
  [
    param("id").isUUID().withMessage("Invalid user ID"),
    body("role")
      .isIn(["regular_user", "approver", "admin"])
      .withMessage("Role must be regular_user, approver, or admin"),
    body("authorityLevel").optional().isInt({ min: 0 }).withMessage("Authority level must be a non-negative integer"),
  ],
  validateRequest,
  updateUserRole,
)

export default router
