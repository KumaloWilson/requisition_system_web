// User types
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "regular_user" | "approver" | "admin"
  authorityLevel: number
  departmentId: string
  department?: Department
}

// Department types
export interface Department {
  id: string
  name: string
  description: string
}

// Requisition types
export interface Requisition {
  id: string
  title: string
  description: string
  requestorId: string
  requestor?: User
  departmentId: string
  department?: Department
  amount: number
  category: string
  priority: "low" | "medium" | "high"
  dueDate: string
  status: "draft" | "pending" | "partially_approved" | "approved" | "rejected" | "revised"
  currentApproverLevel: number
  revisionNumber: number
  originalRequisitionId?: string
  createdAt: string
  updatedAt: string
  approvals?: Approval[]
  attachments?: Attachment[]
}

// Approval types
export interface Approval {
  id: string
  requisitionId: string
  requisition?: Requisition
  approverId: string
  approver?: User
  status: "pending" | "approved" | "rejected"
  comment?: string
  approverLevel: number
  createdAt: string
  updatedAt: string
}

// Attachment types
export interface Attachment {
  id: string
  requisitionId: string
  fileName: string
  fileType: string
  fileUrl: string
  fileSize: number
}

// Workflow types
export interface ApprovalWorkflow {
  id: string
  departmentId: string
  department?: Department
  categoryId: string
  amountThreshold: number
  approverSequence: number[]
}

// Pagination types
export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

// API response types
export interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

export interface PaginatedResponse<T> {
  status: string
  data: {
    items: T[]
    pagination: Pagination
  }
}
