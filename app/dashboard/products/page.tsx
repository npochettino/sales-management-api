"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, Edit, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { type Product, calculateMargin } from "@/lib/models/product"
import type { Category } from "@/lib/models/category"
import { productService } from "@/services/productService"
import { categoryService } from "@/services/categoryService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/use-toast"
import type { ObjectId } from "mongodb"

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const categoriesResponse = await categoryService.getCategories()
      if (!categoriesResponse.success) {
        throw new Error(categoriesResponse.message || "Failed to load categories")
      }

      if (categoriesResponse.data.length === 0) {
        // If no categories, try one more time (in case they're being initialized)
        setTimeout(async () => {
          const retryResponse = await categoryService.getCategories()
          if (retryResponse.success) {
            setCategories(retryResponse.data)
          }
          setLoadingCategories(false)
        }, 1000)
      } else {
        setCategories(categoriesResponse.data)
        setLoadingCategories(false)
      }
    } catch (err: any) {
      console.error("Error loading categories:", err)
      setLoadingCategories(false)
      // Don't set error state here, just log it
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load categories first
      await loadCategories()

      // Then load products
      const productsResponse = await productService.getProducts()
      if (!productsResponse.success) {
        throw new Error(productsResponse.message || "Failed to load products")
      }
      setProducts(productsResponse.data)
    } catch (err: any) {
      setError(err.message || "Failed to load data")
      toast({
        title: "Error",
        description: err.message || "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      // Use the filters object
      const filters: { categoryId?: string; search?: string } = {}

      if (selectedCategory && selectedCategory !== "all") {
        filters.categoryId = selectedCategory
      }

      if (searchTerm) {
        filters.search = searchTerm
      }

      const response = await productService.getProducts(Object.keys(filters).length > 0 ? filters : undefined)
      if (response.success) {
        setProducts(response.data)
      } else {
        throw new Error(response.message || "Failed to search products")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to search products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = async (value: string) => {
    try {
      setSelectedCategory(value)
      setLoading(true)

      // Use the filters object
      const filters: { categoryId?: string; search?: string } = {}

      if (value && value !== "all") {
        filters.categoryId = value
      }

      if (searchTerm) {
        filters.search = searchTerm
      }

      const response = await productService.getProducts(Object.keys(filters).length > 0 ? filters : undefined)
      if (response.success) {
        setProducts(response.data)
      } else {
        throw new Error(response.message || "Failed to filter products")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to filter products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete?._id) return

    try {
      const response = await productService.deleteProduct(productToDelete._id.toString())
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Product deleted successfully",
        })

        // Refresh the product list
        const updatedProducts = products.filter((p) => p._id?.toString() !== productToDelete._id?.toString())
        setProducts(updatedProducts)
      } else {
        throw new Error(response.message || "Failed to delete product")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const resetFilters = async () => {
    setSearchTerm("")
    setSelectedCategory("")
    try {
      setLoading(true)
      const response = await productService.getProducts()
      if (response.success) {
        setProducts(response.data)
      } else {
        throw new Error(response.message || "Failed to reset filters")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to reset filters",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (categoryId?: string | ObjectId) => {
    if (!categoryId) return "#6B7280" // Default gray
    const category = categories.find((c) => c._id?.toString() === categoryId.toString())
    return category?.color || "#6B7280"
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="flex items-center text-red-500 mb-4">
          <AlertCircle className="mr-2" />
          <span>Error loading products</span>
        </div>
        <Button onClick={loadData}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.length === 0 ? (
                  <div className="px-2 py-4 text-center">
                    <div className="text-sm text-gray-500 mb-2">No categories found</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        loadCategories()
                      }}
                      disabled={loadingCategories}
                      className="w-full"
                    >
                      {loadingCategories ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category._id?.toString()} value={category._id?.toString() || "none"}>
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color || "#6B7280" }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {(searchTerm || selectedCategory) && (
              <Button variant="ghost" onClick={resetFilters} size="icon">
                ✕
              </Button>
            )}

            <Button asChild>
              <Link href="/dashboard/products/new">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            searchTerm || selectedCategory
              ? "Try adjusting your search or filters"
              : "Create your first product to get started"
          }
          action={
            searchTerm || selectedCategory ? (
              <Button onClick={resetFilters}>Clear Filters</Button>
            ) : (
              <Button asChild>
                <Link href="/dashboard/products/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Cost</th>
                <th className="px-4 py-2 text-right">Margin</th>
                <th className="px-4 py-2 text-right">Stock</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id?.toString()} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/products/${product._id}`} className="font-medium hover:underline">
                      {product.name}
                    </Link>
                    {product.sku && <div className="text-xs text-gray-500">SKU: {product.sku}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {product.categoryName ? (
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getCategoryColor(product.categoryId) }}
                        />
                        <span>{product.categoryName}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">${product.price?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">${product.cost?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{calculateMargin(product).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right">{product.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/products/${product._id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{productToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
