"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Home, FileText, CheckSquare, Clock, Users, Briefcase, Settings, X } from "react-feather"

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const navItems = [
    { name: "Dashboard", path: "/", icon: Home, show: true },
    { name: "My Requisitions", path: "/requisitions", icon: FileText, show: true },
    {
      name: "Pending Approvals",
      path: "/approvals/pending",
      icon: CheckSquare,
      show: user?.role === "approver" || user?.role === "admin",
    },
    { name: "Approval History", path: "/approvals/history", icon: Clock, show: true },
    { name: "User Management", path: "/admin/users", icon: Users, show: user?.role === "admin" },
    { name: "Department Management", path: "/admin/departments", icon: Briefcase, show: user?.role === "admin" },
    { name: "Workflow Management", path: "/admin/workflows", icon: Settings, show: user?.role === "admin" },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Requisition System
          </Link>
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar content */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive(item.path) ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
        </nav>

        {/* User info */}
        <div className="flex items-center p-4 border-t">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {user?.firstName.charAt(0)}
            {user?.lastName.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role.replace("_", " ")}</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
