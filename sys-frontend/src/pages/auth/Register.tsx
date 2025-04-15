"use client"

import { useState, type FormEvent, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import toast from "react-hot-toast"
import type { Department } from "../../types"
import { Mail, Lock, User, Briefcase, UserPlus } from "react-feather"

const Register = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [departments, setDepartments] = useState<Department[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoadingDepartments(true)
      try {
        const response = await api.get("/departments")
        setDepartments(response.data.data.departments)
      } catch (error) {
        console.error("Failed to fetch departments:", error)
      } finally {
        setIsLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all required fields")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsSubmitting(true)

    try {
      await register({ firstName, lastName, email, password, departmentId: departmentId || undefined })
      toast.success("Registration successful")
      navigate("/")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-card">
        <div>
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-lg">
              <UserPlus className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">Create a new account</h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Or{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="grid grid-cols-1 gap-y-2 gap-x-3 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor="first-name" className="sr-only">
                  First name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-t-md sm:rounded-tr-none focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="last-name" className="sr-only">
                  Last name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-secondary-300 placeholder-secondary-500 text-secondary-900 sm:rounded-tr-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-secondary-300 placeholder-secondary-500 text-secondary-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-secondary-300 placeholder-secondary-500 text-secondary-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-secondary-300 placeholder-secondary-500 text-secondary-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="department" className="sr-only">
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-secondary-400" />
                </div>
                <select
                  id="department"
                  name="department"
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={isLoadingDepartments}
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {isLoadingDepartments && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 transition-colors"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-primary-500 group-hover:text-primary-400" aria-hidden="true" />
              </span>
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
