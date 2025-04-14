"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import toast from "react-hot-toast"
import type { Approval } from "../../types"
import { Check, X, Eye } from "react-feather"

const PendingApprovals = () => {
  const { user } = useAuth()
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [approvalComment, setApprovalComment] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      setIsLoading(true)
      try {
        const response = await api.get("/approvals/pending")
        setPendingApprovals(response.data.data.pendingApprovals)
      } catch (error) {
        console.error("Failed to fetch pending approvals:", error)
        toast.error("Failed to load pending approvals")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingApprovals()
  }, [])

  const handleApprove = (approval: Approval) => {
    setSelectedApproval(approval)
    setApprovalComment("")
    setShowApproveModal(true)
  }

  const handleReject = (approval: Approval) => {
    setSelectedApproval(approval)
    setRejectionReason("")
    setShowRejectModal(true)
  }

  const confirmApprove = async () => {
    if (!selectedApproval) return

    setIsSubmitting(true)
    try {
      await api.post(`/approvals/${selectedApproval.requisitionId}/approve`, {
        comment: approvalComment,
      })
      toast.success("Requisition approved successfully")

      // Remove the approved requisition from the list
      setPendingApprovals((prev) => prev.filter((a) => a.id !== selectedApproval.id))
      setShowApproveModal(false)
    } catch (error) {
      console.error("Failed to approve requisition:", error)
      toast.error("Failed to approve requisition")
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmReject = async () => {
    if (!selectedApproval) return

    if (!rejectionReason) {
      toast.error("Please provide a reason for rejection")
      return
    }

    setIsSubmitting(true)
    try {
      await api.post(`/approvals/${selectedApproval.requisitionId}/reject`, {
        comment: rejectionReason,
      })
      toast.success("Requisition rejected")

      // Remove the rejected requisition from the list
      setPendingApprovals((prev) => prev.filter((a) => a.id !== selectedApproval.id))
      setShowRejectModal(false)
    } catch (error) {
      console.error("Failed to reject requisition:", error)
      toast.error("Failed to reject requisition")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Requisitions waiting for your approval (Level {user?.authorityLevel})
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {pendingApprovals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Requisition
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Requestor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Department
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Submitted
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingApprovals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/requisitions/${approval.requisitionId}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {approval.requisition?.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {approval.requisition?.requestor?.firstName} {approval.requisition?.requestor?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {approval.requisition?.department?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {approval.requisition?.category.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${approval.requisition?.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/requisitions/${approval.requisitionId}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleApprove(approval)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(approval)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any requisitions waiting for your approval.</p>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedApproval && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Approve Requisition</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to approve this requisition? You can add an optional comment below.
                      </p>
                      <div className="mt-4">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                          Comment (Optional)
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="comment"
                            name="comment"
                            rows={3}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmApprove}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isSubmitting ? "Approving..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApproval && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Reject Requisition</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to reject this requisition? Please provide a reason for rejection.
                      </p>
                      <div className="mt-4">
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                          Reason for Rejection <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="reason"
                            name="reason"
                            rows={3}
                            required
                            className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmReject}
                  disabled={isSubmitting || !rejectionReason}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Rejecting..." : "Reject"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingApprovals
