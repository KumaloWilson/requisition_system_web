"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import type { Requisition, Approval } from "../types"
import { FileText, Clock, Check, X, ArrowRight } from "react-feather"

const Dashboard = () => {
  const { user } = useAuth()
  const [requisitions, setRequisitions] = useState<Requisition[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch recent requisitions
        const requisitionsResponse = await api.get("/requisitions", {
          params: { limit: 5 },
        })
        setRequisitions(requisitionsResponse.data.data.requisitions)

        // Calculate stats
        const allRequisitions = requisitionsResponse.data.data.requisitions
        const statsData = {
          draft: allRequisitions.filter((req: Requisition) => req.status === "draft").length,
          pending: allRequisitions.filter(
            (req: Requisition) => req.status === "pending" || req.status === "partially_approved",
          ).length,
          approved: allRequisitions.filter((req: Requisition) => req.status === "approved").length,
          rejected: allRequisitions.filter((req: Requisition) => req.status === "rejected").length,
        }
        setStats(statsData)

        // Fetch pending approvals if user is an approver or admin
        if (user?.role === "approver" || user?.role === "admin") {
          const approvalsResponse = await api.get("/approvals/pending")
          setPendingApprovals(approvalsResponse.data.data.pendingApprovals)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
            Draft
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        )
      case "partially_approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            <Clock className="mr-1 h-3 w-3" />
            Partially Approved
          </span>
        )
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            <Check className="mr-1 h-3 w-3" />
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
            <X className="mr-1 h-3 w-3" />
            Rejected
          </span>
        )
      case "revised":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
            Revised
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
            {status}
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Welcome back, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-card rounded-lg transition-shadow hover:shadow-card-hover">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">Draft Requisitions</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-secondary-900">{stats.draft}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-secondary-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/requisitions?status=draft"
                className="font-medium text-primary-600 hover:text-primary-500 flex items-center justify-between"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-card rounded-lg transition-shadow hover:shadow-card-hover">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-warning-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">Pending Requisitions</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-secondary-900">{stats.pending}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-secondary-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/requisitions?status=pending"
                className="font-medium text-primary-600 hover:text-primary-500 flex items-center justify-between"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-card rounded-lg transition-shadow hover:shadow-card-hover">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-success-100 rounded-md p-3">
                <Check className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">Approved Requisitions</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-secondary-900">{stats.approved}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-secondary-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/requisitions?status=approved"
                className="font-medium text-primary-600 hover:text-primary-500 flex items-center justify-between"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-card rounded-lg transition-shadow hover:shadow-card-hover">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-danger-100 rounded-md p-3">
                <X className="h-6 w-6 text-danger-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">Rejected Requisitions</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-secondary-900">{stats.rejected}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-secondary-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/requisitions?status=rejected"
                className="font-medium text-primary-600 hover:text-primary-500 flex items-center justify-between"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requisitions */}
      <div className="bg-white shadow-card rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-secondary-100">
          <div>
            <h2 className="text-lg font-medium text-secondary-900">Recent Requisitions</h2>
            <p className="mt-1 text-sm text-secondary-500">Your most recent requisition requests</p>
          </div>
          <Link
            to="/requisitions/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Create New
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {requisitions.length > 0 ? (
                requisitions.map((requisition) => (
                  <tr key={requisition.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/requisitions/${requisition.id}`}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        {requisition.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 capitalize">
                      {requisition.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      ${requisition.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(requisition.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {new Date(requisition.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-secondary-500">
                    No requisitions found.{" "}
                    <Link to="/requisitions/create" className="text-primary-600 hover:text-primary-900">
                      Create your first requisition
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {requisitions.length > 0 && (
          <div className="bg-secondary-50 px-4 py-3 border-t border-secondary-200 sm:px-6">
            <div className="text-sm">
              <Link
                to="/requisitions"
                className="font-medium text-primary-600 hover:text-primary-500 flex items-center"
              >
                View all requisitions
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pending Approvals (for approvers and admins) */}
      {(user?.role === "approver" || user?.role === "admin") && (
        <div className="bg-white shadow-card rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-secondary-100">
            <h2 className="text-lg font-medium text-secondary-900">Pending Approvals</h2>
            <p className="mt-1 text-sm text-secondary-500">Requisitions waiting for your approval</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  >
                    Requisition
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  >
                    Requestor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  >
                    Submitted
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.map((approval) => (
                    <tr key={approval.id} className="hover:bg-secondary-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/requisitions/${approval.requisitionId}`}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          {approval.requisition?.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {approval.requisition?.requestor?.firstName} {approval.requisition?.requestor?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        ${approval.requisition?.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                        {new Date(approval.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/requisitions/${approval.requisitionId}`}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-secondary-500">
                      No pending approvals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pendingApprovals.length > 0 && (
            <div className="bg-secondary-50 px-4 py-3 border-t border-secondary-200 sm:px-6">
              <div className="text-sm">
                <Link
                  to="/approvals/pending"
                  className="font-medium text-primary-600 hover:text-primary-500 flex items-center"
                >
                  View all pending approvals
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
