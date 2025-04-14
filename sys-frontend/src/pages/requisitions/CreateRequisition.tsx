"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import toast from "react-hot-toast"
import type { Department } from "../../types"

const CreateRequisition = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    departmentId: user?.departmentId || "",
    amount: "",
    category: "",
    priority: "medium",
    dueDate: "",
  })

  const [departments, setDepartments] = useState<Department[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [submitType, setSubmitType] = useState<"draft" | "submit">("draft")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch departments
        const departmentsResponse = await api.get("/departments")
        setDepartments(departmentsResponse.data.data.departments)

        // Set default department if user has one
        if (user?.departmentId) {
          setFormData((prev) => ({ ...prev, departmentId: user.departmentId }))
        }

        // For categories, we would typically fetch from an API endpoint
        // For now, let's use some sample categories
        setCategories(["equipment", "service", "travel", "software", "hardware", "office_supplies", "other"])
      } catch (error) {
        console.error("Failed to fetch form data:", error)
        toast.error("Failed to load form data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

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

      // Create requisition
      const response = await api.post("/requisitions", requisitionData)
      const requisitionId = response.data.data.requisition.id

      // If user wants to submit directly, call the submit endpoint
      if (submitType === "submit") {
        await api.post(`/requisitions/${requisitionId}/submit`)
        toast.success("Requisition submitted successfully")
      } else {
        toast.success("Requisition saved as draft")
      }

      // Navigate to the requisition detail page
      navigate(`/requisitions/${requisitionId}`)
    } catch (error) {
      console.error("Failed to create requisition:", error)
      toast.error("Failed to create requisition. Please try again.")
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
        <h1 className="text-2xl font-bold text-gray-900">Create Requisition</h1>
        <p className="mt-1 text-sm text-gray-500">Create a new requisition request</p>
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
            <button
              type="button"
              onClick={() => navigate("/requisitions")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => setSubmitType("draft")}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              onClick={() => setSubmitType("submit")}
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRequisition
