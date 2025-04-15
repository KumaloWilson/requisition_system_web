"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  Home,
  FileText,
  CheckSquare,
  Clock,
  Users,
  Briefcase,
  Settings,
  X,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  BarChart2,
} from "react-feather"

interface SidebarProps {
  id?: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const Sidebar = ({ id, isOpen, setIsOpen }: SidebarProps) => {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: Home,
      show: true,
      badge: null,
    },
    {
      name: "My Requisitions",
      path: "/requisitions",
      icon: FileText,
      show: true,
      badge: { count: 3, color: "bg-primary-500" },
    },
    {
      name: "Pending Approvals",
      path: "/approvals/pending",
      icon: CheckSquare,
      show: user?.role === "approver" || user?.role === "admin",
      badge: { count: 5, color: "bg-warning-500" },
    },
    {
      name: "Approval History",
      path: "/approvals/history",
      icon: Clock,
      show: true,
      badge: null,
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: Users,
      show: user?.role === "admin",
      badge: null,
    },
    {
      name: "Department Management",
      path: "/admin/departments",
      icon: Briefcase,
      show: user?.role === "admin",
      badge: null,
    },
    {
      name: "Workflow Management",
      path: "/admin/workflows",
      icon: Settings,
      show: user?.role === "admin",
      badge: null,
    },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-secondary-900 bg-opacity-50 transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        id={id}
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg md:sticky md:top-0 md:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-100 bg-gradient-to-r from-primary-700 to-primary-600 text-white">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <BarChart2 className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">ReqSystem</span>
          </Link>
          <button
            className="md:hidden p-2 rounded-md text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex flex-col h-[calc(100%-4rem)]">
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative ${
                    isActive(item.path)
                      ? "bg-primary-50 text-primary-700 shadow-sm"
                      : "text-secondary-700 hover:bg-secondary-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className={`flex items-center justify-center h-6 w-6 mr-3 ${
                      isActive(item.path) ? "text-primary-600" : "text-secondary-500 group-hover:text-secondary-700"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <span className={`${item.badge.color} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
                      {item.badge.count}
                    </span>
                  )}
                  {isActive(item.path) && (
                    <span
                      className="absolute inset-y-0 left-0 w-1 bg-primary-600 rounded-r-md"
                      aria-hidden="true"
                    ></span>
                  )}
                </Link>
              ))}

            {/* Quick actions section */}
            <div className="pt-4 mt-4 border-t border-secondary-100">
              <h3 className="px-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Quick Actions</h3>
              <div className="mt-2 space-y-1">
                <Link
                  to="/requisitions/create"
                  className="flex items-center px-3 py-2 text-sm font-medium text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <PlusCircle className="mr-3 h-5 w-5 text-secondary-500" />
                  New Requisition
                </Link>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-sm font-medium text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  <HelpCircle className="mr-3 h-5 w-5 text-secondary-500" />
                  Help & Support
                </a>
              </div>
            </div>
          </nav>

          {/* User info */}
          <div className="flex items-center p-4 border-t border-secondary-100 bg-secondary-50">
            <div className="flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-sm">
                {user?.firstName.charAt(0)}
                {user?.lastName.charAt(0)}
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-secondary-500 truncate capitalize">{user?.role.replace("_", " ")}</p>
            </div>
            <Link
              to="/profile"
              className="ml-auto flex-shrink-0 p-1 rounded-full text-secondary-500 hover:text-secondary-700 hover:bg-secondary-200 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
