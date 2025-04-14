"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import api from "../services/api"
import type { User } from "../types"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUserContext: (userData: User) => void
}

interface AuthProviderProps {
  children: ReactNode
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  departmentId?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await api.get("/auth/profile")
          setUser(response.data.data.user)
        } catch (error) {
          console.error("Failed to fetch user profile:", error)
          localStorage.removeItem("token")
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [token])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post("/auth/login", { email, password })
      const { token, user } = response.data.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setToken(token)
      setUser(user)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await api.post("/auth/register", userData)
      const { token, user } = response.data.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setToken(token)
      setUser(user)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common["Authorization"]
  }

  const updateUserContext = (userData: User) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
