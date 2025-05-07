"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { saleService } from "@/services/saleService"
import type { Sale } from "@/lib/models/sale"

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  })

  const fetchSales = async () => {
    try {
      setLoading(true)

      const filterParams: any = {}
      if (filters.status) filterParams.status = filters.status
      if (filters.startDate) filterParams.startDate = new Date(filters.startDate)
      if (filters.endDate) filterParams.endDate = new Date(filters.endDate)

      const response = await saleService.getSales(filterParams)
      setSales(response.data)
      setError("")
    } catch (err: any) {
      setError(err.message || "Failed to fetch sales")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [])

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSales()
  }

  const handleCancelSale = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this sale?")) return

    try {
      await saleService.updateSaleStatus(id, "cancelled")
      await fetchSales()
    } catch (err: any) {
      setError(err.message || "Failed to cancel sale")
    }
  }

  const handleDeleteSale = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sale? This can only be done for pending sales.")) return

    try {
      await saleService.deleteSale(id)
      await fetchSales()
    } catch (err: any) {
      setError(err.message || "Failed to delete sale")
    }
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales</h1>
        <Link href="/dashboard/sales/new" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Create New Sale
        </Link>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <form onSubmit={handleApplyFilters} className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center">Loading sales...</div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Sale ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No sales found. Create your first sale!
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id?.toString()}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <Link href={`/dashboard/sales/${sale._id}`} className="text-blue-600 hover:text-blue-900">
                        #{sale._id?.toString().slice(-6)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(sale.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Client #{sale.clientId.toString().slice(-6)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          sale.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : sale.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link href={`/dashboard/sales/${sale._id}`} className="mr-2 text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                      {sale.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleCancelSale(sale._id!.toString())}
                            className="mr-2 text-yellow-600 hover:text-yellow-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale._id!.toString())}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
