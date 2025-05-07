"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { productService } from "@/services/productService"
import type { Product, PriceHistory } from "@/lib/models/product"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true)

        // Make sure we have a valid ID
        if (!params.id) {
          setError("Invalid product ID")
          setLoading(false)
          return
        }

        // Fetch the product with its price history
        const response = await productService.getProduct(params.id, true)
        setProduct(response.data)

        // If price history was included in the response
        if (response.data.priceHistory) {
          setPriceHistory(response.data.priceHistory)
        } else {
          // Otherwise fetch it separately
          const historyResponse = await productService.getPriceHistory(params.id)
          setPriceHistory(historyResponse.data)
        }

        setLoading(false)
      } catch (err: any) {
        setError(err.message || "Failed to fetch product details")
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [params.id])

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString()
  }

  // Calculate profit margin percentage
  const calculateMargin = (cost: number | undefined | null, price: number | undefined | null) => {
    // Handle undefined or null values
    if (cost === undefined || cost === null || price === undefined || price === null) {
      return "N/A"
    }

    if (cost === 0) return "∞"
    const margin = ((price - cost) / price) * 100
    return margin.toFixed(2) + "%"
  }

  if (loading) {
    return <div className="text-center">Loading product details...</div>
  }

  if (error) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
  }

  if (!product) {
    return <div className="text-center">Product not found</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Link href="/dashboard/products" className="text-blue-600 hover:text-blue-900">
          Back to Products
        </Link>
      </div>

      {/* Product Details */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Product Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Name:</span>
              <span>{product.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Category:</span>
              <span>{product.category}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Description:</span>
              <span>{product.description}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Current Stock:</span>
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  product.stock > 10
                    ? "bg-green-100 text-green-800"
                    : product.stock > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Created:</span>
              <span>{formatDate(product.createdAt)}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium">Last Updated:</span>
              <span>{formatDate(product.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Financial Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Cost Price:</span>
              <span className="font-mono">
                ${product.cost !== undefined && product.cost !== null ? product.cost.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Sale Price:</span>
              <span className="font-mono">
                ${product.price !== undefined && product.price !== null ? product.price.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Profit per Unit:</span>
              <span className="font-mono">${((product.price || 0) - (product.cost || 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Profit Margin:</span>
              <span className="font-mono">{calculateMargin(product.cost, product.price)}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium">Inventory Value:</span>
              <span className="font-mono">${((product.cost || 0) * product.stock).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price History */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium">Price History</h2>
        {priceHistory.length === 0 ? (
          <p className="text-center text-gray-500">No price change history available for this product.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Cost Before
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Cost After
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Price Before
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Price After
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {priceHistory.map((history, index) => (
                  <tr key={index} className={index === 0 ? "bg-blue-50" : ""}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(history.date)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {history.costBefore !== undefined && history.costBefore !== null
                        ? `$${history.costBefore.toFixed(2)}`
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ${history.costAfter.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {history.priceBefore !== undefined && history.priceBefore !== null
                        ? `$${history.priceBefore.toFixed(2)}`
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ${history.priceAfter.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{history.reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
