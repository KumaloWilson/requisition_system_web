"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import toast from "react-hot-toast"
import type { Department, Requisition } from "../../types"
import { ArrowLeft } from "react-feather"

const ReviseRequisition = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    departmentId: "",
    amount: "",
    category: "",
    priority: "medium",
    dueDate: "",
  })

  const [departments, setDepartments] = useState<Department[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [requisition, setRequisition] = useState<Requisition | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch requisition details
        const requisitionResponse = await api.get(`/requisitions/${id}`)
        const requisitionData = requisitionResponse.data.data.requisition

        setRequisition(requisitionData)

        // Check if user can revise this requisition
        if (requisitionData.requestorId !== user?.id) {
          toast.error("You don't have permission to revise this requisition")
          navigate(`/requisitions/${id}`)
          return
        }

        if (requisitionData.status !== "rejected") {
          toast.error("Only rejected requisitions can be revised")
          navigate(`/requisitions/${id}`)
          return
        }

        // Fetch departments
        const departmentsResponse = await api.get("/departments")
        setDepartments(departmentsResponse.data.data.departments)

        // For categories, we would typically fetch from an API endpoint
        // For now, let's use some sample categories
        setCategories(["equipment", "service", "travel", "software", "hardware", "office_supplies", "other"])

        // Set form data from requisition
        setFormData({
          title: requisitionData.title,
          description: requisitionData.description,
          departmentId: requisitionData.departmentId,
          amount: requisitionData.amount.toString(),
          category: requisitionData.category,
          priority: requisitionData.priority,
          dueDate: requisitionData.dueDate ? new Date(requisitionData.dueDate).toISOString().split("T")[0] : "",
        })

        // Get rejection reason from approvals
        const approvalsResponse = await api.get(`/approvals/${id}/history`)
        const approvals = approvalsResponse.data.data.approvals
        const rejectionApproval = approvals.find((approval: any) => approval.status === "rejected")
        if (rejectionApproval) {
          setRejectionReason(rejectionApproval.comment || "No reason provided")
        }
      } catch (error) {
        console.error("Failed to fetch requisition data:", error)
        toast.error("Failed to load requisition data")
        navigate("/requisitions")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, user, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.departmentId || !formData.category) {
        toast.error("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      // Convert amount to number
      const requisitionData = {
        ...formData,
        amount: formData.amount ? Number.parseFloat(formData.amount) : 0,
      }

      // Revise requisition
      const response = await api.post(`/requisitions/${id}/revise`, requisitionData)
      const newRequisitionId = response.data.data.requisition.id
      toast.success("Requisition revised successfully")

      // Submit the revised requisition
      await api.post(`/requisitions/${newRequisitionId}/submit`)
      toast.success("Revised requisition submitted for approval")

      // Navigate to the new requisition detail page
      navigate(`/requisitions/${newRequisitionId}`)
    } catch (error) {
      console.error("Failed to revise requisition:", error)
      toast.error("Failed to revise requisition. Please try again.")
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

  if (!requisition) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Requisition not found</h2>
          <p className="mt-1 text-sm text-gray-500">
            The requisition you're trying to revise doesn't exist or you don't have permission to revise it.
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
      <div>
        <div className="flex items-center">
          <Link to={`/requisitions/${id}`} className="mr-2 text-blue-600 hover:text-blue-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Revise Requisition</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">Update your requisition based on the rejection feedback</p>
      </div>

      {/* Rejection Reason */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Rejection Reason</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{rejectionReason}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Provide a detailed description of what you're requesting and why it's needed.
              </p>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="departmentId"
                  name="departmentId"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.departmentId}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  name="category"
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount ($)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  step="0.01"
                  min="0"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <div className="mt-1">
                <select
                  id="priority"
                  name="priority"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">When do you need this by?</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              to={`/requisitions/${id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? "Submitting..." : "Submit Revised Requisition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviseRequisition
