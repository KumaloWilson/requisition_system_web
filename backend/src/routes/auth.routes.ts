import { Router } from "express"
import { body } from "express-validator"
import { authenticate } from "../middleware/auth"
import { login, register, logout, refreshToken, getProfile, updateProfile } from "../controllers/auth.controller"
import { validateRequest } from "../middleware/validate"

const router = Router()

// Register a new user
router.post(
  "/register",
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
    body("departmentId").optional().isUUID().withMessage("Invalid department ID"),
  ],
  validateRequest,
  register,
)

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login,
)

// Logout
router.post("/logout", authenticate, logout)

// Refresh token
router.post("/refresh-token", refreshToken)

// Get user profile
router.get("/profile", authenticate, getProfile)

// Update user profile
router.put(
  "/profile",
  authenticate,
  [
    body("firstName").optional().notEmpty().withMessage("First name cannot be empty"),
    body("lastName").optional().notEmpty().withMessage("Last name cannot be empty"),
    body("email").optional().isEmail().withMessage("Please provide a valid email"),
    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
  ],
  validateRequest,
  updateProfile,
)

export default router
