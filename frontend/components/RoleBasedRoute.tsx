"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import type { JSX } from "react/jsx-runtime"

interface RoleBasedRouteProps {
  children: JSX.Element
  allowedRoles: string[]
}

const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleBasedRoute
