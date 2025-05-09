"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { DollarSign, Search, Star, Users } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { clientService } from "@/services/clientService"
import { saleService } from "@/services/saleService"
import type { Client } from "@/lib/models/client"
import type { Sale } from "@/lib/models/sale"

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function CRMPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Client data
  const [clients, setClients] = useState<Client[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [clientSegments, setClientSegments] = useState<any[]>([])
  const [topClients, setTopClients] = useState<any[]>([])
  const [clientRetention, setClientRetention] = useState<any[]>([])

  // Summary metrics
  const [totalClients, setTotalClients] = useState(0)
  const [newClients, setNewClients] = useState(0)
  const [activeClients, setActiveClients] = useState(0)
  const [averageLifetimeValue, setAverageLifetimeValue] = useState(0)

  useEffect(() => {
    const fetchCRMData = async () => {
      try {
        setLoading(true)

        // Fetch clients data
        const clientsResponse = await clientService.getClients(searchTerm || undefined)
        const clientsData = clientsResponse.data

        // Fetch sales data
        const salesResponse = await saleService.getSales()
        const salesData = salesResponse.data

        // Set raw data
        setClients(clientsData)
        setSales(salesData)

        // Process data for CRM analysis
        processCRMData(clientsData, salesData)

        setLoading(false)
      } catch (err: any) {
        setError(err.message || "Failed to fetch CRM data")
        setLoading(false)
      }
    }

    fetchCRMData()
  }, [searchTerm])

  const processCRMData = (clients: Client[], sales: Sale[]) => {
    // Skip processing if no data
    if (!clients.length) return

    // Calculate summary metrics
    calculateCRMMetrics(clients, sales)

    // Process client segments
    processClientSegments(clients, sales)

    // Process top clients
    processTopClients(clients, sales)

    // Process client retention
    processClientRetention(clients, sales)
  }

  const calculateCRMMetrics = (clients: Client[], sales: Sale[]) => {
    // Total clients
    setTotalClients(clients.length)

    // New clients (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newClientsCount = clients.filter((client) => new Date(client.createdAt) >= thirtyDaysAgo).length

    setNewClients(newClientsCount)

    // Active clients (made a purchase in last 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const clientsWithRecentSales = new Set()

    sales.forEach((sale) => {
      if (new Date(sale.createdAt) >= ninetyDaysAgo) {
        clientsWithRecentSales.add(sale.clientId.toString())
      }
    })

    setActiveClients(clientsWithRecentSales.size)

    // Average lifetime value
    const clientSalesMap: Record<string, number> = {}

    sales.forEach((sale) => {
      const clientId = sale.clientId.toString()

      if (!clientSalesMap[clientId]) {
        clientSalesMap[clientId] = 0
      }

      clientSalesMap[clientId] += sale.total
    })

    const totalLifetimeValue = Object.values(clientSalesMap).reduce((sum, value) => sum + value, 0)
    const avgLTV = Object.keys(clientSalesMap).length > 0 ? totalLifetimeValue / Object.keys(clientSalesMap).length : 0

    setAverageLifetimeValue(avgLTV)
  }

  const processClientSegments = (clients: Client[], sales: Sale[]) => {
    // Create a map of client purchase totals
    const clientPurchaseMap: Record<string, number> = {}

    sales.forEach((sale) => {
      const clientId = sale.clientId.toString()

      if (!clientPurchaseMap[clientId]) {
        clientPurchaseMap[clientId] = 0
      }

      clientPurchaseMap[clientId] += sale.total
    })

    // Define segments
    const segments = {
      VIP: { min: 1000, count: 0 },
      Regular: { min: 500, count: 0 },
      Occasional: { min: 100, count: 0 },
      New: { min: 0, count: 0 },
    }

    // Count clients in each segment
    Object.values(clientPurchaseMap).forEach((total) => {
      if (total >= segments.VIP.min) {
        segments.VIP.count++
      } else if (total >= segments.Regular.min) {
        segments.Regular.count++
      } else if (total >= segments.Occasional.min) {
        segments.Occasional.count++
      } else {
        segments.New.count++
      }
    })

    // Add clients with no purchases to "New" segment
    const clientsWithPurchases = new Set(Object.keys(clientPurchaseMap))
    const clientsWithoutPurchases = clients.filter((client) => !clientsWithPurchases.has(client._id?.toString() || ""))

    segments.New.count += clientsWithoutPurchases.length

    // Convert to array for chart
    const segmentData = Object.entries(segments).map(([name, data]) => ({
      name,
      value: data.count,
    }))

    setClientSegments(segmentData)
  }

  const processTopClients = (clients: Client[], sales: Sale[]) => {
    // Create a map of client purchase totals
    const clientPurchaseMap: Record<string, { total: number; count: number }> = {}

    sales.forEach((sale) => {
      const clientId = sale.clientId.toString()

      if (!clientPurchaseMap[clientId]) {
        clientPurchaseMap[clientId] = { total: 0, count: 0 }
      }

      clientPurchaseMap[clientId].total += sale.total
      clientPurchaseMap[clientId].count += 1
    })

    // Map to client names and create data array
    const topClientsData = clients
      .filter((client) => clientPurchaseMap[client._id?.toString() || ""])
      .map((client) => ({
        id: client._id?.toString(),
        name: client.name,
        email: client.email,
        phone: client.phone,
        total: clientPurchaseMap[client._id?.toString() || ""]?.total || 0,
        orders: clientPurchaseMap[client._id?.toString() || ""]?.count || 0,
        averageOrder: clientPurchaseMap[client._id?.toString() || ""]?.count
          ? clientPurchaseMap[client._id?.toString() || ""].total /
            clientPurchaseMap[client._id?.toString() || ""].count
          : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10) // Top 10 clients

    setTopClients(topClientsData)
  }

  const processClientRetention = (clients: Client[], sales: Sale[]) => {
    // Group sales by month
    const salesByMonth: Record<string, { new: number; returning: number }> = {}
    const clientFirstPurchase: Record<string, string> = {}

    // Sort sales by date
    const sortedSales = [...sales].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    // Process sales to determine new vs returning clients
    sortedSales.forEach((sale) => {
      const clientId = sale.clientId.toString()
      const date = new Date(sale.createdAt)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`

      if (!salesByMonth[monthKey]) {
        salesByMonth[monthKey] = { new: 0, returning: 0 }
      }

      if (!clientFirstPurchase[clientId]) {
        // First purchase by this client
        clientFirstPurchase[clientId] = monthKey
        salesByMonth[monthKey].new += 1
      } else if (clientFirstPurchase[clientId] !== monthKey) {
        // Returning client
        salesByMonth[monthKey].returning += 1
      }
    })

    // Convert to array for chart
    const retentionData = Object.entries(salesByMonth)
      .map(([month, data]) => ({
        month,
        new: data.new,
        returning: data.returning,
      }))
      .sort((a, b) => {
        const [aYear, aMonth] = a.month.split("-").map(Number)
        const [bYear, bMonth] = b.month.split("-").map(Number)

        if (aYear !== bYear) return aYear - bYear
        return aMonth - bMonth
      })
      .slice(-6) // Last 6 months

    setClientRetention(retentionData)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading CRM data..." />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customer Relationship Management</h1>
        <p className="text-gray-600 mt-1">Manage and analyze your customer relationships</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Clients */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Clients</h3>
            <span className="bg-blue-100 text-blue-800 p-2 rounded-full">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{totalClients}</p>
          </div>
        </div>

        {/* New Clients */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">New Clients (30d)</h3>
            <span className="bg-green-100 text-green-800 p-2 rounded-full">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{newClients}</p>
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Clients (90d)</h3>
            <span className="bg-purple-100 text-purple-800 p-2 rounded-full">
              <Star className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{activeClients}</p>
          </div>
        </div>

        {/* Average LTV */}
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Avg. Lifetime Value</h3>
            <span className="bg-yellow-100 text-yellow-800 p-2 rounded-full">
              <DollarSign className="h-5 w-5" />
            </span>
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">${averageLifetimeValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Client Segments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Client Segments</h3>
          <div className="h-80">
            {clientSegments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No client segment data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Retention */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">New vs Returning Clients</h3>
          <div className="h-80">
            {clientRetention.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientRetention} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="new" name="New Clients" fill="#0088FE" />
                  <Bar dataKey="returning" name="Returning Clients" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No client retention data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Clients</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Spent
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Orders
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Avg. Order
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topClients.length > 0 ? (
                topClients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${client.total.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.orders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${client.averageOrder.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/clients/${client.id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No client data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">All Clients</h3>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Client
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client._id?.toString()}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/clients/${client._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/clients/${client._id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
