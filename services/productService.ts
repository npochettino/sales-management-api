import { fetchApi } from "@/lib/api"
import type { Product } from "@/lib/models/product"

type ProductsResponse = {
  success: boolean
  data: Product[]
}

type ProductResponse = {
  success: boolean
  data: Product
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
  getProduct: async (id: string) => {
    return fetchApi<ProductResponse>(`products/${id}`)
  },

  // Create a new product
  createProduct: async (product: Omit<Product, "_id" | "createdAt" | "updatedAt">) => {
    return fetchApi<ProductResponse>("products", "POST", product)
  },

  // Update a product
  updateProduct: async (id: string, product: Partial<Product>) => {
    return fetchApi<ProductResponse>(`products/${id}`, "PUT", product)
  },

  // Delete a product
  deleteProduct: async (id: string) => {
    return fetchApi<{ success: boolean; message: string }>(`products/${id}`, "DELETE")
  },
}
