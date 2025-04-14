import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Suspense, lazy } from "react"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleBasedRoute from "./components/RoleBasedRoute"
import LoadingScreen from "./components/LoadingScreen"
import Layout from "./components/Layout"


// Lazy load pages for better performance
const Login = lazy(() => import("./pages/auth/Login"))
const Register = lazy(() => import("./pages/auth/Register"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const RequisitionList = lazy(() => import("./pages/requisitions/RequisitionList"))
const RequisitionDetail = lazy(() => import("./pages/requisitions/RequisitionDetail"))
const CreateRequisition = lazy(() => import("./pages/requisitions/CreateRequisition"))
const EditRequisition = lazy(() => import("./pages/requisitions/EditRequisition"))
const ReviseRequisition = lazy(() => import("./pages/requisitions/ReviseRequisition"))
const PendingApprovals = lazy(() => import("./pages/approvals/PendingApprovals"))
const ApprovalHistory = lazy(() => import("./pages/approvals/ApprovalHistory"))
const UserManagement = lazy(() => import("./pages/admin/UserManagement"))
const DepartmentManagement = lazy(() => import("./pages/admin/DepartmentManagement"))
const WorkflowManagement = lazy(() => import("./pages/admin/WorkflowManagement"))
const Profile = lazy(() => import("./pages/Profile"))
const NotFound = lazy(() => import("./pages/NotFound"))

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Requisition routes */}
              <Route path="/requisitions" element={<RequisitionList />} />
              <Route path="/requisitions/create" element={<CreateRequisition />} />
              <Route path="/requisitions/:id" element={<RequisitionDetail />} />
              <Route path="/requisitions/:id/edit" element={<EditRequisition />} />
              <Route path="/requisitions/:id/revise" element={<ReviseRequisition />} />

              {/* Approval routes - only for approvers and admins */}
              <Route
                path="/approvals/pending"
                element={
                  <RoleBasedRoute allowedRoles={["approver", "admin"]}>
                    <PendingApprovals />
                  </RoleBasedRoute>
                }
              />
              <Route path="/approvals/history" element={<ApprovalHistory />} />

              {/* Admin routes */}
              <Route
                path="/admin/users"
                element={
                  <RoleBasedRoute allowedRoles={["admin"]}>
                    <UserManagement />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <RoleBasedRoute allowedRoles={["admin"]}>
                    <DepartmentManagement />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/admin/workflows"
                element={
                  <RoleBasedRoute allowedRoles={["admin"]}>
                    <WorkflowManagement />
                  </RoleBasedRoute>
                }
              />
            </Route>

            {/* Fallback routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

export default App
