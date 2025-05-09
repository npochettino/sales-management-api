"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { ErrorBoundary } from "@/components/error-boundary"
import { BarChart, Building, DollarSign, Home, Menu, Package, ShoppingCart, Users, X } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null // Will redirect in the useEffect
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Clients", href: "/dashboard/clients", icon: Users },
    { name: "Sales", href: "/dashboard/sales", icon: ShoppingCart },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart },
    { name: "Finances", href: "/dashboard/finances", icon: DollarSign },
    { name: "CRM", href: "/dashboard/crm", icon: Users },
    { name: "Suppliers", href: "/dashboard/suppliers", icon: Building },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu */}
      <div className="md:hidden">
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        {/* Mobile menu panel */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform ease-in-out duration-300 bg-white ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <span className="text-xl font-bold text-blue-600">SalesManager</span>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="overflow-y-auto h-full pb-16">
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"}`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile top bar */}
        <div className="sticky top-0 z-10 bg-white shadow">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              type="button"
              className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <span className="text-xl font-bold text-blue-600">SalesManager</span>
            <div className="w-6"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-blue-600">SalesManager</span>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"}`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <svg
                  className="inline-block h-9 w-9 rounded-full text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.email}</p>
                <button onClick={handleLogout} className="text-xs font-medium text-gray-500 hover:text-gray-700">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6 md:py-6 md:pt-0 px-4 sm:px-6 md:px-8">
            {/* Add top padding on mobile to account for the fixed header */}
            <div className="md:pt-0 pt-16">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
