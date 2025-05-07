import { fetchApi } from "@/lib/api"
import type { Client } from "@/lib/models/client"

type ClientsResponse = {
  success: boolean
  data: Client[]
}

type ClientResponse = {
  success: boolean
  data: Client
}

export const clientService = {
  // Get all clients
  getClients: async (search?: string) => {
    let queryParams = ""

    if (search) {
      queryParams = `?search=${encodeURIComponent(search)}`
    }

    return fetchApi<ClientsResponse>(`clients${queryParams}`)
  },

  // Get a single client
  getClient: async (id: string) => {
    return fetchApi<ClientResponse>(`clients/${id}`)
  },

  // Create a new client
  createClient: async (client: Omit<Client, "_id" | "createdAt" | "updatedAt">) => {
    return fetchApi<ClientResponse>("clients", "POST", client)
  },

  // Update a client
  updateClient: async (id: string, client: Partial<Client>) => {
    return fetchApi<ClientResponse>(`clients/${id}`, "PUT", client)
  },

  // Delete a client
  deleteClient: async (id: string) => {
    return fetchApi<{ success: boolean; message: string }>(`clients/${id}`, "DELETE")
  },
}
