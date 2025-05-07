import { getSession } from "next-auth/react";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE"

export async function fetchApi<T>(endpoint: string, method: RequestMethod = "GET", data?: any): Promise<T> {
  try {
    // Get the session
    const session = await getSession();
    console.log("Current session:", session);
    
    if (!session) {
      throw new Error("Not authenticated - No session found");
    }

    // Make the request with credentials included
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: This includes cookies in the request
    };

    // Add the body if there's data
    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`Making ${method} request to /api/${endpoint}`);
    const response = await fetch(`/api/${endpoint}`, options);
    
    // Parse the response
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`API error (${response.status}):`, result);
      throw new Error(result.error || result.message || "Something went wrong");
    }

    return result as T;
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}