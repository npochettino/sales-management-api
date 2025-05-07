import { fetchApi } from "@/lib/api"
import type { Sale, PaymentMethod } from "@/lib/models/sale"

type SalesResponse = {
  success: boolean
  data: Sale[]
}

type SaleResponse = {
  success: boolean
  data: Sale & { client?: any }
}

type SaleCreateInput = {
  clientId: string
  items: {
    productId: string
    quantity: number
  }[]
  paymentMethods: PaymentMethod[]
  status?: "pending" | "completed" | "cancelled"
}

export const saleService = {
  // Get all sales
  getSales: async (filters?: {
    clientId?: string
    status?: string
    startDate?: Date
    endDate?: Date
  }) => {
    let queryParams = ""

    if (filters) {
      const params = new URLSearchParams()
      if (filters.clientId) params.append("clientId", filters.clientId)
      if (filters.status) params.append("status", filters.status)
      if (filters.startDate) params.append("startDate", filters.startDate.toISOString())
      if (filters.endDate) params.append("endDate", filters.endDate.toISOString())
      queryParams = `?${params.toString()}`
    }

    return fetchApi<SalesResponse>(`sales${queryParams}`)
  },

  // Get a single sale
  getSale: async (id: string) => {
    return fetchApi<SaleResponse>(`sales/${id}`)
  },

  // Create a new sale
  createSale: async (sale: SaleCreateInput) => {
    return fetchApi<SaleResponse>("sales", "POST", sale)
  },

  // Update a sale status
  updateSaleStatus: async (id: string, status: "pending" | "completed" | "cancelled") => {
    return fetchApi<SaleResponse>(`sales/${id}`, "PUT", { status })
  },

  // Delete a sale
  deleteSale: async (id: string) => {
    return fetchApi<{ success: boolean; message: string }>(`sales/${id}`, "DELETE")
  },
}
