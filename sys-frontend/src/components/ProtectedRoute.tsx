"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoadingScreen from "./LoadingScreen"
import type { JSX } from "react/jsx-runtime"

interface ProtectedRouteProps {
  children: JSX.Element
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
