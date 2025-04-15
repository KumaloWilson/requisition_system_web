import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleBasedRoute from "./components/RoleBasedRoute"
import Layout from "./components/Layout"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Dashboard from "./pages/Dashboard"
import RequisitionList from "./pages/requisitions/RequisitionList"
import CreateRequisition from "./pages/requisitions/CreateRequisition"
import RequisitionDetail from "./pages/requisitions/RequisitionDetail"
import EditRequisition from "./pages/requisitions/EditRequisition"
import ReviseRequisition from "./pages/requisitions/ReviseRequisition"
import PendingApprovals from "./pages/approvals/PendingApprovals"
import ApprovalHistory from "./pages/approvals/ApprovalHistory"
import UserManagement from "./pages/admin/UserManagement"
import DepartmentManagement from "./pages/admin/DepartmentManagement"
import WorkflowManagement from "./pages/admin/WorkflowManagement"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"

// Import CSS
import "./index.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="requisitions" element={<RequisitionList />} />
            <Route path="requisitions/create" element={<CreateRequisition />} />
            <Route path="requisitions/:id" element={<RequisitionDetail />} />
            <Route path="requisitions/:id/edit" element={<EditRequisition />} />
            <Route path="requisitions/:id/revise" element={<ReviseRequisition />} />
            <Route
              path="approvals/pending"
              element={
                <RoleBasedRoute allowedRoles={["approver", "admin"]}>
                  <PendingApprovals />
                </RoleBasedRoute>
              }
            />
            <Route path="approvals/history" element={<ApprovalHistory />} />
            <Route
              path="admin/users"
              element={
                <RoleBasedRoute allowedRoles={["admin"]}>
                  <UserManagement />
                </RoleBasedRoute>
              }
            />
            <Route
              path="admin/departments"
              element={
                <RoleBasedRoute allowedRoles={["admin"]}>
                  <DepartmentManagement />
                </RoleBasedRoute>
              }
            />
            <Route
              path="admin/workflows"
              element={
                <RoleBasedRoute allowedRoles={["admin"]}>
                  <WorkflowManagement />
                </RoleBasedRoute>
              }
            />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 404 Route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
