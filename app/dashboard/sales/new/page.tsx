"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { productService } from "@/services/productService"
import { clientService } from "@/services/clientService"
import { saleService } from "@/services/saleService"
import type { Product } from "@/lib/models/product"
import type { Client } from "@/lib/models/client"
import type { PaymentMethod } from "@/lib/models/sale"

export default function NewSalePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Data
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])

  // Form state
  const [selectedClient, setSelectedClient] = useState("")
  const [saleItems, setSaleItems] = useState<
    {
      productId: string
      productName: string
      quantity: number
      price: number
      subtotal: number
    }[]
  >([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([{ type: "cash", amount: 0 }])

  // Calculated values
  const total = saleItems.reduce((sum, item) => sum + item.subtotal, 0)
  const paymentTotal = paymentMethods.reduce((sum, method) => sum + method.amount, 0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch products with stock
        const productsResponse = await productService.getProducts({ inStock: true })
        setProducts(productsResponse.data)

        // Fetch clients
        const clientsResponse = await clientService.getClients()
        setClients(clientsResponse.data)

        setLoading(false)
      } catch (err: any) {
        setError(err.message || "Failed to fetch data")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddItem = () => {
    setSaleItems([
      ...saleItems,
      {
        productId: "",
        productName: "",
        quantity: 1,
        price: 0,
        subtotal: 0,
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...saleItems]

    if (field === "productId") {
      const product = products.find((p) => p._id?.toString() === value)
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value as string,
          productName: product.name,
          price: product.price,
          subtotal: product.price * newItems[index].quantity,
        }
      }
    } else if (field === "quantity") {
      const quantity = Math.max(1, Number(value))
      newItems[index] = {
        ...newItems[index],
        quantity,
        subtotal: newItems[index].price * quantity,
      }
    }

    setSaleItems(newItems)
  }

  const handleAddPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { type: "cash", amount: 0 }])
  }

  const handleRemovePaymentMethod = (index: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index))
  }

  const handlePaymentMethodChange = (index: number, field: string, value: string | number) => {
    const newMethods = [...paymentMethods]

    if (field === "type") {
      newMethods[index] = {
        ...newMethods[index],
        type: value as "cash" | "credit" | "debit" | "transfer" | "other",
      }
    } else if (field === "amount") {
      newMethods[index] = {
        ...newMethods[index],
        amount: Number(value),
      }
    } else if (field === "reference") {
      newMethods[index] = {
        ...newMethods[index],
        reference: value as string,
      }
    }

    setPaymentMethods(newMethods)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!selectedClient) {
      setError("Please select a client")
      return
    }

    if (saleItems.length === 0) {
      setError("Please add at least one product")
      return
    }

    if (saleItems.some((item) => !item.productId)) {
      setError("Please select a product for all items")
      return
    }

    if (Math.abs(total - paymentTotal) > 0.01) {
      setError(`Payment total (${paymentTotal.toFixed(2)}) does not match sale total (${total.toFixed(2)})`)
      return
    }

    try {
      setSubmitting(true)
      setError("")

      const saleData = {
        clientId: selectedClient,
        items: saleItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethods,
        status: "completed" as const,
      }

      await saleService.createSale(saleData)
      setSuccess("Sale created successfully!")

      // Reset form
      setSelectedClient("")
      setSaleItems([])
      setPaymentMethods([{ type: "cash", amount: 0 }])

      // Redirect to sales list after a short delay
      setTimeout(() => {
        router.push("/dashboard/sales")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to create sale")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Create New Sale</h1>

      {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Client Information</h2>
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700">
              Select Client
            </label>
            <select
              id="client"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">-- Select a client --</option>
              {clients.map((client) => (
                <option key={client._id?.toString()} value={client._id?.toString()}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Products</h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>

          {saleItems.length === 0 ? (
            <p className="text-center text-gray-500">No products added yet. Click "Add Product" to start.</p>
          ) : (
            <div className="space-y-4">
              {saleItems.map((item, index) => (
                <div key={index} className="rounded-md border border-gray-200 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">Product #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="">-- Select a product --</option>
                        {products.map((product) => (
                          <option key={product._id?.toString()} value={product._id?.toString()}>
                            {product.name} (${product.price.toFixed(2)}) - {product.stock} in stock
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subtotal</label>
                      <div className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                        ${item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end border-t pt-4">
                <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Payment Methods</h2>
            <button
              type="button"
              onClick={handleAddPaymentMethod}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Payment Method
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="rounded-md border border-gray-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">Payment Method #{index + 1}</h3>
                  {paymentMethods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePaymentMethod(index)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={method.type}
                      onChange={(e) => handlePaymentMethodChange(index, "type", e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="credit">Credit Card</option>
                      <option value="debit">Debit Card</option>
                      <option value="transfer">Bank Transfer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={method.amount}
                      onChange={(e) => handlePaymentMethodChange(index, "amount", e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reference (Optional)</label>
                    <input
                      type="text"
                      value={method.reference || ""}
                      onChange={(e) => handlePaymentMethodChange(index, "reference", e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end border-t pt-4">
              <div className={`text-xl font-bold ${Math.abs(total - paymentTotal) > 0.01 ? "text-red-600" : ""}`}>
                Payment Total: ${paymentTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating Sale..." : "Create Sale"}
          </button>
        </div>
      </form>
    </div>
  )
}
