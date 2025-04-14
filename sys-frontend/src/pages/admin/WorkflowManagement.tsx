"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import api from "../../services/api"
import toast from "react-hot-toast"
import type { ApprovalWorkflow, Department } from "../../types"
import { Edit, Trash, Plus, X } from "react-feather"

// Define categories for requisitions
const REQUISITION_CATEGORIES = [
  { id: "equipment", name: "Equipment" },
  { id: "supplies", name: "Office Supplies" },
  { id: "travel", name: "Travel" },
  { id: "training", name: "Training" },
  { id: "software", name: "Software" },
  { id: "services", name: "Professional Services" },
  { id: "other", name: "Other" },
]

const WorkflowManagement = () => {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  const [formData, setFormData] = useState({
    departmentId: "",
    categoryId: "",
    amountThreshold: "0",
    approverSequence: ["1"],
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch workflows
        const workflowsResponse = await api.get("/workflows")
        setWorkflows(workflowsResponse.data.data.workflows)

        // Fetch departments
        const departmentsResponse = await api.get("/departments")
        setDepartments(departmentsResponse.data.data.departments)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load workflows")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleApproverLevelChange = (index: number, value: string) => {
    const newApproverSequence = [...formData.approverSequence]
    newApproverSequence[index] = value
    setFormData((prev) => ({ ...prev, approverSequence: newApproverSequence }))
  }

  const addApproverLevel = () => {
    setFormData((prev) => ({
      ...prev,
      approverSequence: [...prev.approverSequence, "1"],
    }))
  }

  const removeApproverLevel = (index: number) => {
    const newApproverSequence = [...formData.approverSequence]
    newApproverSequence.splice(index, 1)
    setFormData((prev) => ({ ...prev, approverSequence: newApproverSequence }))
  }

  const handleCreateWorkflow = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.departmentId || !formData.categoryId) {
        toast.error("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      // Convert approver sequence to numbers
      const approverSequence = formData.approverSequence.map((level) => Number.parseInt(level, 10))

      // Prepare workflow data
      const workflowData = {
        departmentId: formData.departmentId,
        categoryId: formData.categoryId,
        amountThreshold: Number.parseFloat(formData.amountThreshold),
        approverSequence,
      }

      // Create workflow
      const response = await api.post("/workflows", workflowData)
      const newWorkflow = response.data.data.workflow

      // Add workflow to list
      setWorkflows((prev) => [...prev, newWorkflow])

      toast.success("Workflow created successfully")
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create workflow:", error)
      toast.error("Failed to create workflow")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditWorkflow = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!selectedWorkflow) return

      // Validate form
      if (!formData.departmentId || !formData.categoryId) {
        toast.error("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      // Convert approver sequence to numbers
      const approverSequence = formData.approverSequence.map((level) => Number.parseInt(level, 10))

      // Prepare update data
      const updateData = {
        departmentId: formData.departmentId,
        categoryId: formData.categoryId,
        amountThreshold: Number.parseFloat(formData.amountThreshold),
        approverSequence,
      }

      // Update workflow
      const response = await api.put(`/workflows/${selectedWorkflow.id}`, updateData)
      const updatedWorkflow = response.data.data.workflow

      // Update workflow in list
      setWorkflows((prev) =>
        prev.map((workflow) => (workflow.id === selectedWorkflow.id ? { ...workflow, ...updatedWorkflow } : workflow)),
      )

      toast.success("Workflow updated successfully")
      setShowEditModal(false)
    } catch (error) {
      console.error("Failed to update workflow:", error)
      toast.error("Failed to update workflow")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteWorkflow = async () => {
    setIsSubmitting(true)
    try {
      if (!selectedWorkflow) return

      // Delete workflow
      await api.delete(`/workflows/${selectedWorkflow.id}`)

      // Remove workflow from list
      setWorkflows((prev) => prev.filter((workflow) => workflow.id !== selectedWorkflow.id))

      toast.success("Workflow deleted successfully")
      setShowDeleteModal(false)
    } catch (error) {
      console.error("Failed to delete workflow:", error)
      toast.error("Failed to delete workflow")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (workflow: ApprovalWorkflow) => {
    setSelectedWorkflow(workflow)
    setFormData({
      departmentId: workflow.departmentId,
      categoryId: workflow.categoryId,
      amountThreshold: workflow.amountThreshold.toString(),
      approverSequence: workflow.approverSequence.map((level) => level.toString()),
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (workflow: ApprovalWorkflow) => {
    setSelectedWorkflow(workflow)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setFormData({
      departmentId: "",
      categoryId: "",
      amountThreshold: "0",
      approverSequence: ["1"],
    })
    setSelectedWorkflow(null)
  }

  const getCategoryName = (categoryId: string) => {
    const category = REQUISITION_CATEGORIES.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dept) => dept.id === departmentId)
    return department ? department.name : "Unknown Department"
  }

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesDepartment = departmentFilter === "" || workflow.departmentId === departmentFilter
    const matchesCategory = categoryFilter === "" || workflow.categoryId === categoryFilter

    return matchesDepartment && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Workflow Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure approval workflows for different departments and requisition categories
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm()
            setShowCreateModal(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700">
              Filter by Department
            </label>
            <select
              id="department-filter"
              name="department-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">
              Filter by Category
            </label>
            <select
              id="category-filter"
              name="category-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {REQUISITION_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workflows Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Amount Threshold
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Approver Sequence
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
              {filteredWorkflows.length > 0 ? (
                filteredWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getDepartmentName(workflow.departmentId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCategoryName(workflow.categoryId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {workflow.amountThreshold > 0 ? `$${workflow.amountThreshold.toLocaleString()}` : "All Amounts"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {workflow.approverSequence.map((level, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                          >
                            Level {index + 1}: Authority {level}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(workflow)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Workflow"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(workflow)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Workflow"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No workflows found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateWorkflow}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Approval Workflow</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="departmentId"
                            name="departmentId"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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

                        <div>
                          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                            Requisition Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="categoryId"
                            name="categoryId"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={formData.categoryId}
                            onChange={handleChange}
                          >
                            <option value="">Select Category</option>
                            {REQUISITION_CATEGORIES.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="amountThreshold" className="block text-sm font-medium text-gray-700">
                            Amount Threshold
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              name="amountThreshold"
                              id="amountThreshold"
                              min="0"
                              step="0.01"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              value={formData.amountThreshold}
                              onChange={handleChange}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Set to 0 if this workflow applies to all amounts. Otherwise, this workflow will apply to
                            requisitions with amounts greater than or equal to this threshold.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Approver Sequence <span className="text-red-500">*</span>
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            Define the sequence of approval levels. Each level corresponds to the authority level of
                            approvers.
                          </p>

                          {formData.approverSequence.map((level, index) => (
                            <div key={index} className="flex items-center mt-2">
                              <div className="flex-grow flex items-center">
                                <span className="mr-2 text-sm text-gray-700">Level {index + 1}:</span>
                                <div className="flex-grow">
                                  <label htmlFor={`approverLevel-${index}`} className="sr-only">
                                    Authority Level
                                  </label>
                                  <input
                                    type="number"
                                    id={`approverLevel-${index}`}
                                    min="1"
                                    required
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={level}
                                    onChange={(e) => handleApproverLevelChange(index, e.target.value)}
                                  />
                                </div>
                              </div>
                              {formData.approverSequence.length > 1 && (
                                <button
                                  type="button"
                                  className="ml-2 text-red-600 hover:text-red-900"
                                  onClick={() => removeApproverLevel(index)}
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={addApproverLevel}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add Approval Level
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isSubmitting ? "Creating..." : "Create Workflow"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workflow Modal */}
      {showEditModal && selectedWorkflow && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditWorkflow}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Approval Workflow</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="departmentId"
                            name="departmentId"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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

                        <div>
                          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                            Requisition Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="categoryId"
                            name="categoryId"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={formData.categoryId}
                            onChange={handleChange}
                          >
                            <option value="">Select Category</option>
                            {REQUISITION_CATEGORIES.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="amountThreshold" className="block text-sm font-medium text-gray-700">
                            Amount Threshold
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                              type="number"
                              name="amountThreshold"
                              id="amountThreshold"
                              min="0"
                              step="0.01"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              value={formData.amountThreshold}
                              onChange={handleChange}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Set to 0 if this workflow applies to all amounts. Otherwise, this workflow will apply to
                            requisitions with amounts greater than or equal to this threshold.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Approver Sequence <span className="text-red-500">*</span>
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            Define the sequence of approval levels. Each level corresponds to the authority level of
                            approvers.
                          </p>

                          {formData.approverSequence.map((level, index) => (
                            <div key={index} className="flex items-center mt-2">
                              <div className="flex-grow flex items-center">
                                <span className="mr-2 text-sm text-gray-700">Level {index + 1}:</span>
                                <div className="flex-grow">
                                  <label htmlFor={`approverLevel-${index}`} className="sr-only">
                                    Authority Level
                                  </label>
                                  <input
                                    type="number"
                                    id={`approverLevel-${index}`}
                                    min="1"
                                    required
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    value={level}
                                    onChange={(e) => handleApproverLevelChange(index, e.target.value)}
                                  />
                                </div>
                              </div>
                              {formData.approverSequence.length > 1 && (
                                <button
                                  type="button"
                                  className="ml-2 text-red-600 hover:text-red-900"
                                  onClick={() => removeApproverLevel(index)}
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={addApproverLevel}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add Approval Level
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Workflow Modal */}
      {showDeleteModal && selectedWorkflow && (
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Workflow</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the approval workflow for{" "}
                        <span className="font-medium">{getCategoryName(selectedWorkflow.categoryId)}</span> in{" "}
                        <span className="font-medium">{getDepartmentName(selectedWorkflow.departmentId)}</span>? This
                        action cannot be undone.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Note: Deleting a workflow may affect the approval process for requisitions in this department
                        and category.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteWorkflow}
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

export default WorkflowManagement
