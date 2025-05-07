import { fetchApi } from "@/lib/api"
import type { Product, PriceHistory } from "@/lib/models/product"

type ProductsResponse = {
  success: boolean
  data: Product[]
}

type ProductResponse = {
  success: boolean
  data: Product & { priceHistory?: PriceHistory[] }
}

type PriceHistoryResponse = {
  success: boolean
  data: PriceHistory[]
}

export const productService = {
  // Get all products
  getProducts: async (filters?: { category?: string; inStock?: boolean }) => {
    let queryParams = ""

    if (filters) {
      const params = new URLSearchParams()
      if (filters.category) params.append("category", filters.category)
      if (filters.inStock) params.append("inStock", "true")
      queryParams = `?${params.toString()}`
    }

    return fetchApi<ProductsResponse>(`products${queryParams}`)
  },

  // Get a single product
  getProduct: async (id: string, includeHistory = false) => {
    if (!id) {
      throw new Error("Product ID is required")
    }
    const queryParams = includeHistory ? "?includeHistory=true" : ""
    return fetchApi<ProductResponse>(`products/${id}${queryParams}`)
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
    return fetchApi<{ success: boolean; message: string }>(`products/${id}`, "DELETE")
  },
}
