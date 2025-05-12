import { fetchApi } from "@/lib/api"
import type { Product } from "@/lib/models/product"
import type { PriceHistory } from "@/lib/models/product"

type ProductsResponse = {
  success: boolean
  data: Product[]
  message?: string // Add message property for error handling
}

type ProductResponse = {
  success: boolean
  data: Product
  message?: string // Add message property for error handling
}

type PriceHistoryResponse = {
  success: boolean
  data: PriceHistory[]
  message?: string // Add message property for error handling
}

type DeleteResponse = {
  success: boolean
  message: string
}

export const productService = {
  // Get all products
  getProducts: async (filters?: { categoryId?: string; search?: string; inStock?: boolean }) => {
    let queryParams = ""

    if (filters) {
      const params = new URLSearchParams()
      if (filters.categoryId) params.append("categoryId", filters.categoryId)
      if (filters.search) params.append("search", filters.search)
      if (filters.inStock) params.append("inStock", "true")
      queryParams = `?${params.toString()}`
    }

    return fetchApi<ProductsResponse>(`products${queryParams}`)
  },

  // Get a single product
  getProduct: async (id: string) => {
    if (!id) {
      throw new Error("Product ID is required")
    }
    return fetchApi<ProductResponse>(`products/${id}`)
  },

  // Get price history for a product
  getPriceHistory: async (id: string) => {
    if (!id) {
      throw new Error("Product ID is required")
    }
    return fetchApi<PriceHistoryResponse>(`products/${id}/price-history`)
  },

  // Create a new product
  createProduct: async (product: Omit<Product, "_id" | "createdAt" | "updatedAt">) => {
    return fetchApi<ProductResponse>("products", "POST", product)
  },

  // Update a product
  updateProduct: async (id: string, product: Partial<Product> & { priceChangeReason?: string }) => {
    if (!id) {
      throw new Error("Product ID is required")
    }
    return fetchApi<ProductResponse>(`products/${id}`, "PUT", product)
  },

  // Delete a product
  deleteProduct: async (id: string) => {
    if (!id) {
      throw new Error("Product ID is required")
    }
    return fetchApi<DeleteResponse>(`products/${id}`, "DELETE")
  },
}
