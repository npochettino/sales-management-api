"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { saleService } from "@/services/saleService"
import { clientService } from "@/services/clientService"
import type { Sale } from "@/lib/models/sale"
import type { Client } from "@/lib/models/client"

export default function SaleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [sale, setSale] = useState<Sale | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        setLoading(true)
        const response = await saleService.getSale(params.id)
        setSale(response.data)

        // Fetch client details
        if (response.data.clientId) {
          const clientResponse = await clientService.getClient(response.data.clientId.toString())
          setClient(clientResponse.data)
        }

        setLoading(false)
      } catch (err: any) {
        setError(err.message || "Failed to fetch sale details")
        setLoading(false)
      }
    }

    fetchSaleDetails()
  }, [params.id])

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

  if (loading) {
    return <div className="text-center">Loading sale details...</div>
  }

  if (error) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
  }

  if (!sale) {
    return <div className="text-center">Sale not found</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Sale #{sale._id?.toString().slice(-6)} - {sale.status.toUpperCase()}
        </h1>
        <Link href="/dashboard/sales" className="text-blue-600 hover:text-blue-900">
          Back to Sales
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Sale Information */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Sale Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Sale ID:</span>
              <span>{sale._id?.toString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Date:</span>
              <span>{formatDate(sale.createdAt)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Status:</span>
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
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Total:</span>
              <span className="font-bold">${sale.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Client Information</h2>
          {client ? (
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Name:</span>
                <span>{client.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Email:</span>
                <span>{client.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Phone:</span>
                <span>{client.phone}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Address:</span>
                <span>{client.address}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Client information not available</div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium">Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Unit Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">${item.unitPrice.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={3} className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900">
                  Total:
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                  ${sale.total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium">Payment Methods</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sale.paymentMethods.map((method, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">${method.amount.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{method.reference || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
