"use client"

import { useState, type FormEvent } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import toast from "react-hot-toast"
import { Mail, Lock, LogIn } from "react-feather"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || "/"

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please enter both email and password")
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)
      toast.success("Login successful")
      navigate(from, { replace: true })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials."
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
              <LogIn className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Or{" "}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
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
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
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
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 transition-colors"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-primary-500 group-hover:text-primary-400" aria-hidden="true" />
              </span>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
