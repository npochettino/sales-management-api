"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { productService } from "@/services/productService"
import { clientService } from "@/services/clientService"
import { saleService } from "@/services/saleService"
import type { Product } from "@/lib/models/product"
import type { Client } from "@/lib/models/client"
import type { Sale } from "@/lib/models/sale"

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth()
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
          setError(err.message || "Failed to fetch data")
          setLoadingData(false)
        }
      }

      fetchData()
    }
  }, [user])

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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {loadingData ? (
          <div className="text-center">Loading data...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Products Card */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Products</h2>
              <p className="text-3xl font-bold">{products.length}</p>
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-medium text-gray-500">Low Stock Products</h3>
                <ul className="space-y-2">
                  {products
                    .filter((product) => product.stock < 10)
                    .slice(0, 3)
                    .map((product) => (
                      <li key={product._id?.toString()} className="flex justify-between">
                        <span>{product.name}</span>
                        <span className="font-medium text-red-600">{product.stock} left</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Clients Card */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Clients</h2>
              <p className="text-3xl font-bold">{clients.length}</p>
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-medium text-gray-500">Recent Clients</h3>
                <ul className="space-y-2">
                  {clients.slice(0, 3).map((client) => (
                    <li key={client._id?.toString()}>
                      {client.name} - {client.email}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent Sales Card */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Recent Sales</h2>
              <ul className="space-y-3">
                {recentSales.map((sale) => (
                  <li key={sale._id?.toString()} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Sale #{sale._id?.toString().slice(-4)}</span>
                      <span className="font-bold">${sale.total.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500">{new Date(sale.createdAt).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
