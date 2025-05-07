import { auth } from "./firebase"

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE"

export async function fetchApi<T>(endpoint: string, method: RequestMethod = "GET", data?: any): Promise<T> {
  try {
    // Get the current user
    const user = auth.currentUser

    // If there's no user, throw an error
    if (!user) {
      throw new Error("Not authenticated")
    }

    // Get the ID token
    const idToken = await user.getIdToken()

    // Prepare the request options
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }

    // Add the body if there's data
    if (data) {
      options.body = JSON.stringify(data)
    }

    // Make the request
    const response = await fetch(`/api/${endpoint}`, options)

    // Parse the response
    const result = await response.json()

    // If the request failed, throw an error with more detailed information
    if (!response.ok) {
      console.error(`API error (${response.status}):`, result)
      throw new Error(result.error || result.message || "Something went wrong")
    }

    // Return the data
    return result as T
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}
