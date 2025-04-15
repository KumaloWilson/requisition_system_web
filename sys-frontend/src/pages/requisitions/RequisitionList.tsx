"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import api from "../../services/api"
import type { Requisition, Pagination } from "../../types"
import { Plus, Filter, Search as SearchIcon, ChevronLeft, ChevronRight, X } from "react-feather"

const RequisitionList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [requisitions, setRequisitions] = useState<Requisition[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    category: searchParams.get("category") || "",
  })
  const [categories, setCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const currentPage = Number(searchParams.get("page") || "1")

  useEffect(() => {
    const fetchRequisitions = async () => {
      setIsLoading(true)
      try {
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: pagination.limit,
        }

        // Add filters to params
        if (searchTerm) params.search = searchTerm
        if (filters.status) params.status = filters.status
        if (filters.priority) params.priority = filters.priority
        if (filters.category) params.category = filters.category

        const response = await api.get("/requisitions", { params })
        setRequisitions(response.data.data.requisitions)
        setPagination(response.data.data.pagination)

        // Extract unique categories for filter dropdown
        const uniqueCategories = Array.from(
          new Set(response.data.data.requisitions.map((req: Requisition) => req.category)),
        ) as string[]
        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Failed to fetch requisitions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequisitions()
  }, [currentPage, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams)
    if (searchTerm) {
      newParams.set("search", searchTerm)
    } else {
      newParams.delete("search")
    }
    newParams.set("page", "1") // Reset to first page on new search
    setSearchParams(newParams)
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(name, value)
    } else {
      newParams.delete(name)
    }
    newParams.set("page", "1") // Reset to first page on filter change
    setSearchParams(newParams)
  }

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("page", page.toString())
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      category: "",
    })
    setSearchTerm("")
    setSearchParams(new URLSearchParams())
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-800">Draft</span>
        )
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-800">Pending</span>
        )
      case "partially_approved":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
            Partially Approved
          </span>
        )
      case "approved":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">Approved</span>
        )
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-danger-100 text-danger-800">Rejected</span>
        )
      case "revised":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-800">
            Revised
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-800">
            {status}
          </span>
        )
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">Low</span>
      case "medium":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-800">Medium</span>
        )
      case "high":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-danger-100 text-danger-800">High</span>
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-800">
            {priority}
          </span>
        )
    }
  }

  const hasActiveFilters = filters.status || filters.priority || filters.category || searchTerm

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Requisitions</h1>
          <p className="mt-1 text-sm text-secondary-500">Manage your requisition requests</p>
        </div>
        <Link
          to="/requisitions/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Requisition
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-card rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-12 sm:text-sm border-secondary-300 rounded-md"
                  placeholder="Search requisitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                  <button
                    type="submit"
                    className="inline-flex items-center px-2 py-1 border border-secondary-300 text-sm font-medium rounded text-secondary-700 bg-secondary-50 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Filter toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-secondary-700">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="partially_approved">Partially Approved</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="revised">Revised</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority-filter" className="block text-sm font-medium text-secondary-700">
                    Priority
                  </label>
                  <select
                    id="priority-filter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={filters.priority}
                    onChange={(e) => handleFilterChange("priority", e.target.value)}
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category-filter" className="block text-sm font-medium text-secondary-700">
                    Category
                  </label>
                  <select
                    id="category-filter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-secondary-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center px-3 py-1.5 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Requisitions Table */}
      <div className="bg-white shadow-card rounded-lg overflow-hidden">
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
                  Priority
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
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                  </td>
                </tr>
              ) : requisitions.length > 0 ? (
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
                    <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(requisition.priority)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(requisition.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {new Date(requisition.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/requisitions/${requisition.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View
                      </Link>
                      {requisition.status === "draft" && (
                        <Link
                          to={`/requisitions/${requisition.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </Link>
                      )}
                      {requisition.status === "rejected" && (
                        <Link
                          to={`/requisitions/${requisition.id}/revise`}
                          className="text-success-600 hover:text-success-900"
                        >
                          Revise
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-secondary-500">
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-secondary-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-secondary-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>{" "}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                          : "bg-white border-secondary-300 text-secondary-500 hover:bg-secondary-50"
                      } transition-colors`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequisitionList
