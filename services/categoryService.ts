import { fetchApi } from "@/lib/api"
import type { Category } from "@/lib/models/category"

type CategoriesResponse = {
  success: boolean
  data: Category[]
  message?: string // Add message property for error handling
}

type CategoryResponse = {
  success: boolean
  data: Category
  message?: string // Add message property for error handling
}

export const categoryService = {
  // Get all categories
  getCategories: async () => {
    return fetchApi<CategoriesResponse>("categories")
  },

  // Get a single category
  getCategory: async (id: string) => {
    if (!id) {
      throw new Error("Category ID is required")
    }
    return fetchApi<CategoryResponse>(`categories/${id}`)
  },

  // Create a new category
  createCategory: async (category: Omit<Category, "_id" | "createdAt" | "updatedAt">) => {
    return fetchApi<CategoryResponse>("categories", "POST", category)
  },

  // Update a category
  updateCategory: async (id: string, category: Partial<Category>) => {
    if (!id) {
      throw new Error("Category ID is required")
    }
    return fetchApi<CategoryResponse>(`categories/${id}`, "PUT", category)
  },

  // Delete a category
  deleteCategory: async (id: string) => {
    if (!id) {
      throw new Error("Category ID is required")
    }
    return fetchApi<{ success: boolean; message: string }>(`categories/${id}`, "DELETE")
  },
}
