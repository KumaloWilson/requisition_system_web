"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import toast from "react-hot-toast"
import type { Requisition, Approval } from "../../types"
import { Clock, Check, X, Edit, ArrowLeft, AlertTriangle } from "react-feather"

const RequisitionDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [requisition, setRequisition] = useState<Requisition | null>(null)
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approvalComment, setApprovalComment] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  useEffect(() => {
    const fetchRequisitionData = async () => {
      setIsLoading(true)
      try {
        // Fetch requisition details
        const requisitionResponse = await api.get(`/requisitions/${id}`)
        setRequisition(requisitionResponse.data.data.requisition)

        // Fetch approval history
        const approvalsResponse = await api.get(`/approvals/${id}/history`)
        setApprovals(approvalsResponse.data.data.approvals)
      } catch (error) {
        console.error("Failed to fetch requisition data:", error)
        toast.error("Failed to load requisition details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequisitionData()
  }, [id])

  const handleSubmitRequisition = async () => {
    setIsSubmitting(true)
    try {
      await api.post(`/requisitions/${id}/submit`)
      toast.success("Requisition submitted for approval")
      // Refresh data
      const response = await api.get(`/requisitions/${id}`)
      setRequisition(response.data.data.requisition)
      setShowSubmitModal(false)
    } catch (error) {
      console.error("Failed to submit requisition:", error)
      toast.error("Failed to submit requisition")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveRequisition = async () => {
    setIsSubmitting(true)
    try {
      await api.post(`/approvals/${id}/approve`, { comment: approvalComment })
      toast.success("Requisition approved successfully")
      // Refresh data
      const requisitionResponse = await api.get(`/requisitions/${id}`)
      setRequisition(requisitionResponse.data.data.requisition)
      const approvalsResponse = await api.get(`/approvals/${id}/history`)
      setApprovals(approvalsResponse.data.data.approvals)
      setShowApproveModal(false)
      setApprovalComment("")
    } catch (error) {
      console.error("Failed to approve requisition:", error)
      toast.error("Failed to approve requisition")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectRequisition = async () => {
    if (!rejectionReason) {
      toast.error("Please provide a reason for rejection")
      return
    }

    setIsSubmitting(true)
    try {
      await api.post(`/approvals/${id}/reject`, { comment: rejectionReason })
      toast.success("Requisition rejected")
      // Refresh data
      const requisitionResponse = await api.get(`/requisitions/${id}`)
      setRequisition(requisitionResponse.data.data.requisition)
      const approvalsResponse = await api.get(`/approvals/${id}/history`)
      setApprovals(approvalsResponse.data.data.approvals)
      setShowRejectModal(false)
      setRejectionReason("")
    } catch (error) {
      console.error("Failed to reject requisition:", error)
      toast.error("Failed to reject requisition")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRequisition = async () => {
    setIsSubmitting(true)
    try {
      await api.delete(`/requisitions/${id}`)
      toast.success("Requisition deleted successfully")
      navigate("/requisitions")
    } catch (error) {
      console.error("Failed to delete requisition:", error)
      toast.error("Failed to delete requisition")
    } finally {
      setIsSubmitting(false)
      setShowDeleteModal(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        )
      case "partially_approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Partially Approved
          </span>
        )
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="mr-1 h-3 w-3" />
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="mr-1 h-3 w-3" />
            Rejected
          </span>
        )
      case "revised":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Edit className="mr-1 h-3 w-3" />
            Revised
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Low
          </span>
        )
      case "medium":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Medium
          </span>
        )
      case "high":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            High
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {priority}
          </span>
        )
    }
  }

  const canApprove = () => {
    if (!user || !requisition) return false
    if (user.role !== "approver" && user.role !== "admin") return false
    if (requisition.status !== "pending" && requisition.status !== "partially_approved") return false
    return requisition.currentApproverLevel === user.authorityLevel
  }

  const canEdit = () => {
    if (!user || !requisition) return false
    if (requisition.requestorId !== user.id) return false
    return requisition.status === "draft"
  }

  const canDelete = () => {
    if (!user || !requisition) return false
    if (requisition.requestorId !== user.id && user.role !== "admin") return false
    return requisition.status === "draft"
  }

  const canSubmit = () => {
    if (!user || !requisition) return false
    if (requisition.requestorId !== user.id) return false
    return requisition.status === "draft" || requisition.status === "revised"
  }

  const canRevise = () => {
    if (!user || !requisition) return false
    if (requisition.requestorId !== user.id) return false
    return requisition.status === "rejected"
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!requisition) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Requisition not found</h2>
          <p className="mt-1 text-sm text-gray-500">
            The requisition you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="mt-6">
            <Link
              to="/requisitions"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Requisitions
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <div className="flex items-center">
            <Link to="/requisitions" className="mr-2 text-blue-600 hover:text-blue-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{requisition.title}</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created on {new Date(requisition.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit() && (
            <Link
              to={`/requisitions/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          )}
          {canRevise() && (
            <Link
              to={`/requisitions/${id}/revise`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Edit className="mr-2 h-4 w-4" />
              Revise
            </Link>
          )}
          {canSubmit() && (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit for Approval
            </button>
          )}
          {canDelete() && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <X className="mr-2 h-4 w-4" />
              Delete
            </button>
          )}
          {canApprove() && (
            <>
              <button
                type="button"
                onClick={() => setShowApproveModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Requisition Details */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Requisition Details</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Request #{requisition.id.substring(0, 8)}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(requisition.status)}
            {getPriorityBadge(requisition.priority)}
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Requestor</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {requisition.requestor?.firstName} {requisition.requestor?.lastName}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">{requisition.department?.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{requisition.category.replace("_", " ")}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900">${requisition.amount.toFixed(2)}</dd>
            </div>
            {requisition.dueDate && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(requisition.dueDate).toLocaleDateString()}</dd>
              </div>
            )}
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Current Approval Level</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {requisition.status === "approved"
                  ? "Fully Approved"
                  : requisition.status === "rejected"
                    ? "Rejected"
                    : requisition.status === "draft" || requisition.status === "revised"
                      ? "Not Submitted"
                      : `Level ${requisition.currentApproverLevel}`}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{requisition.description}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Approval History */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Approval History</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Track the approval process for this requisition</p>
        </div>
        <div className="border-t border-gray-200">
          {approvals.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {approvals.map((approval) => (
                <li key={approval.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          {approval.approver?.firstName.charAt(0)}
                          {approval.approver?.lastName.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {approval.approver?.firstName} {approval.approver?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">Level {approval.approverLevel} Approver</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-sm text-gray-500">{new Date(approval.updatedAt).toLocaleString()}</div>
                      {approval.status === "pending" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      ) : approval.status === "approved" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                  {approval.comment && (
                    <div className="mt-2 text-sm text-gray-700">
                      <div className="font-medium">Comment:</div>
                      <div className="mt-1">{approval.comment}</div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-sm text-gray-500">No approval history available</div>
          )}
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
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
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Submit Requisition</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to submit this requisition for approval? Once submitted, you won't be able
                        to edit it unless it's rejected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmitRequisition}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
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
                  onClick={handleApproveRequisition}
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
      {showRejectModal && (
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
                  onClick={handleRejectRequisition}
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

      {/* Delete Modal */}
      {showDeleteModal && (
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
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Requisition</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this requisition? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteRequisition}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
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

export default RequisitionDetail
