"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { productService } from "@/services/productService"
import { clientService } from "@/services/clientService"
import { saleService } from "@/services/saleService"
import type { Product } from "@/lib/models/product"
import type { Client } from "@/lib/models/client"
import type { Sale } from "@/lib/models/sale"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { AlertCircle, BarChart3, Package, ShoppingCart, Users } from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    // Only fetch data if we have a user
    if (user) {
      const fetchData = async () => {
        try {
          setLoadingData(true)
          setError("") // Clear any previous errors

          // Fetch products
          const productsResponse = await productService.getProducts()
          setProducts(productsResponse.data)

          // Fetch clients
          const clientsResponse = await clientService.getClients()
          setClients(clientsResponse.data)

          // Fetch recent sales
          const salesResponse = await saleService.getSales()
          setRecentSales(salesResponse.data.slice(0, 5)) // Get only the 5 most recent

          setLoadingData(false)
        } catch (err: any) {
          console.error("Dashboard data fetch error:", err)
          setError(err.message || "Failed to fetch data")
          setLoadingData(false)
        }
      }

      fetchData()
    }
  }, [user])

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in the useEffect
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your business.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading dashboard data</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Products Stat */}
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
                <span className="bg-blue-100 text-blue-800 p-2 rounded-full">
                  <Package className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline">
                <p className="text-3xl font-semibold text-gray-900">{products.length}</p>
                <p className="ml-2 text-sm text-gray-600">items</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/products"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  View all products
                </Link>
              </div>
            </div>

            {/* Clients Stat */}
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Total Clients</h3>
                <span className="bg-green-100 text-green-800 p-2 rounded-full">
                  <Users className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline">
                <p className="text-3xl font-semibold text-gray-900">{clients.length}</p>
                <p className="ml-2 text-sm text-gray-600">clients</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/clients"
                  className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center"
                >
                  View all clients
                </Link>
              </div>
            </div>

            {/* Sales Stat */}
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Recent Sales</h3>
                <span className="bg-purple-100 text-purple-800 p-2 rounded-full">
                  <ShoppingCart className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline">
                <p className="text-3xl font-semibold text-gray-900">{recentSales.length}</p>
                <p className="ml-2 text-sm text-gray-600">sales</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/sales"
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
                >
                  View all sales
                </Link>
              </div>
            </div>

            {/* Revenue Stat */}
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                <span className="bg-yellow-100 text-yellow-800 p-2 rounded-full">
                  <BarChart3 className="h-5 w-5" />
                </span>
              </div>
              <div className="flex items-baseline">
                <p className="text-3xl font-semibold text-gray-900">
                  ${recentSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/sales"
                  className="text-sm text-yellow-600 hover:text-yellow-800 font-medium flex items-center"
                >
                  View sales details
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Products */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Low Stock Products</h3>
              </div>
              <div className="px-6 py-4">
                {products.filter((product) => product.stock < 10).length === 0 ? (
                  <EmptyState
                    icon={<Package className="h-12 w-12" />}
                    title="No low stock products"
                    description="All your products have sufficient stock levels."
                  />
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {products
                      .filter((product) => product.stock < 10)
                      .slice(0, 5)
                      .map((product) => (
                        <li key={product._id?.toString()} className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.stock === 0
                                  ? "bg-red-100 text-red-800"
                                  : product.stock < 5
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {product.stock} in stock
                            </span>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
              </div>
              <div className="px-6 py-4">
                {recentSales.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingCart className="h-12 w-12" />}
                    title="No sales yet"
                    description="Start creating sales to see them here."
                    action={
                      <Link
                        href="/dashboard/sales/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Create Sale
                      </Link>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {recentSales.map((sale) => (
                      <li key={sale._id?.toString()} className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Sale #{sale._id?.toString().slice(-6)}</p>
                            <p className="text-sm text-gray-500">{new Date(sale.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">${sale.total.toFixed(2)}</p>
                            <p
                              className={`text-xs ${
                                sale.status === "completed"
                                  ? "text-green-600"
                                  : sale.status === "pending"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {sale.status.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
