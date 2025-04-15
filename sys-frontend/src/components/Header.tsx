"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Menu, X, Bell, User, LogOut, Settings, Search } from "react-feather"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="bg-white shadow-sm z-10 transition-all duration-200 w-full">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu button and logo */}
          <div className="flex items-center">
            <button
              id="sidebar-button"
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              {sidebarOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {/* Logo for mobile */}
            <div className="md:hidden ml-2">
              <h1 className="text-lg font-semibold text-primary-700">Requisition System</h1>
            </div>

            {/* Search bar - visible on larger screens */}
            <div className="hidden md:block ml-4">
              <div
                className={`relative rounded-md shadow-sm transition-all duration-200 ${searchFocused ? "ring-2 ring-primary-500" : ""}`}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-secondary-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border-secondary-200 rounded-md focus:outline-none focus:ring-0 focus:border-secondary-200 sm:text-sm"
                  placeholder="Search..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>
          </div>

          {/* Right side - User menu & notifications */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                className="p-1 rounded-full text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <Bell className="h-6 w-6" aria-hidden="true" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white"></span>
                </div>
              </button>

              {/* Notifications dropdown */}
              {notificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-dropdown bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-slide-in z-50">
                  <div className="py-2 px-4 border-b border-secondary-100">
                    <h3 className="text-sm font-medium text-secondary-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="py-2 px-4 text-sm text-secondary-500 border-b border-secondary-100 hover:bg-secondary-50">
                      <p className="font-medium text-secondary-900">New requisition submitted</p>
                      <p>John Doe submitted a new requisition for approval</p>
                      <p className="mt-1 text-xs text-secondary-400">2 hours ago</p>
                    </div>
                    <div className="py-2 px-4 text-sm text-secondary-500 border-b border-secondary-100 hover:bg-secondary-50">
                      <p className="font-medium text-secondary-900">Requisition approved</p>
                      <p>Your requisition #1234 has been approved</p>
                      <p className="mt-1 text-xs text-secondary-400">Yesterday</p>
                    </div>
                    <div className="py-2 px-4 text-sm text-secondary-500 hover:bg-secondary-50">
                      <p className="font-medium text-secondary-900">Requisition needs revision</p>
                      <p>Your requisition #1235 needs revision</p>
                      <p className="mt-1 text-xs text-secondary-400">2 days ago</p>
                    </div>
                  </div>
                  <div className="py-2 px-4 border-t border-secondary-100 text-center">
                    <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      View all notifications
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 p-1 hover:bg-secondary-100 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-sm">
                  {user?.firstName.charAt(0)}
                  {user?.lastName.charAt(0)}
                </div>
                <span className="ml-2 text-secondary-700 hidden md:block font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <svg
                  className="hidden md:block ml-1 h-5 w-5 text-secondary-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-dropdown bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-slide-in z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-secondary-100">
                      <p className="text-sm font-medium text-secondary-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4 text-secondary-500" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4 text-secondary-500" />
                      Settings
                    </Link>
                    <div className="border-t border-secondary-100 mt-1 pt-1">
                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 transition-colors"
                        onClick={() => {
                          logout()
                          setUserMenuOpen(false)
                        }}
                      >
                        <LogOut className="mr-3 h-4 w-4 text-secondary-500" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
