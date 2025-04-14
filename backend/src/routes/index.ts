import { Router } from "express"
import authRoutes from "./auth.routes"
import userRoutes from "./user.routes"
import departmentRoutes from "./department.routes"
import requisitionRoutes from "./requisition.routes"
import approvalRoutes from "./approval.routes"
import workflowRoutes from "./workflow.routes"

const router = Router()

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
    timestamp: new Date().toISOString(),
  })
})

// API routes
router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/departments", departmentRoutes)
router.use("/requisitions", requisitionRoutes)
router.use("/approvals", approvalRoutes)
router.use("/workflows", workflowRoutes)

export default router
