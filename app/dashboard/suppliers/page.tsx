"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertCircle, Building, Edit, Plus, Trash2 } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"

// Supplier type definition
interface Supplier {
  _id?: string
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  products: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockSuppliers: Supplier[] = [
        {
          _id: "1",
          name: "ABC Distributors",
          contactName: "John Smith",
          email: "john@abcdist.com",
          phone: "555-123-4567",
          address: "123 Main St, Anytown, USA",
          products: ["Electronics", "Computers"],
          notes: "Reliable supplier with good prices",
          createdAt: new Date("2023-01-15"),
          updatedAt: new Date("2023-06-20"),
        },
        {
          _id: "2",
          name: "XYZ Manufacturing",
          contactName: "Jane Doe",
          email: "jane@xyzmanufacturing.com",
          phone: "555-987-6543",
          address: "456 Oak Ave, Somewhere, USA",
          products: ["Hardware", "Tools"],
          notes: "Fast shipping, minimum order $500",
          createdAt: new Date("2023-02-10"),
          updatedAt: new Date("2023-05-15"),
        },
        {
          _id: "3",
          name: "Global Imports",
          contactName: "Robert Johnson",
          email: "robert@globalimports.com",
          phone: "555-456-7890",
          address: "789 Pine St, Elsewhere, USA",
          products: ["Clothing", "Accessories"],
          notes: "",
          createdAt: new Date("2023-03-05"),
          updatedAt: new Date("2023-04-10"),
        },
      ]

      setSuppliers(mockSuppliers)
      setLoading(false)
    }, 1000)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    })
    setEditingSupplier(null)
  }

  const handleAddNew = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      notes: supplier.notes || "",
    })
    setEditingSupplier(supplier)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return

    // In a real app, you would call an API here
    setSuppliers(suppliers.filter((supplier) => supplier._id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would call an API here
    const newSupplier: Supplier = {
      _id: editingSupplier?._id || Date.now().toString(),
      ...formData,
      products: editingSupplier?.products || [],
      createdAt: editingSupplier?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    if (editingSupplier) {
      setSuppliers(suppliers.map((supplier) => (supplier._id === editingSupplier._id ? newSupplier : supplier)))
    } else {
      setSuppliers([...suppliers, newSupplier])
    }

    resetForm()
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading suppliers..." />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage your product suppliers</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {editingSupplier ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {suppliers.length === 0 ? (
        <EmptyState
          icon={<Building className="h-12 w-12" />}
          title="No suppliers yet"
          description="Add your first supplier to start managing your supply chain."
          action={
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Company
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Products
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Notes
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {suppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                    <div className="text-sm text-gray-500">{supplier.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{supplier.contactName}</div>
                    <div className="text-sm text-gray-500">{supplier.email}</div>
                    <div className="text-sm text-gray-500">{supplier.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {supplier.products.map((product, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{supplier.notes || "No notes"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(supplier._id!)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
