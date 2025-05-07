import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Client } from "@/lib/models/client"

// GET all clients
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    const searchParams = request.nextUrl.searchParams
    const query: any = {}

    // Add search filter if provided
    if (searchParams.has("search")) {
      const searchTerm = searchParams.get("search")
      query.$or = [{ name: { $regex: searchTerm, $options: "i" } }, { email: { $regex: searchTerm, $options: "i" } }]
    }

    const clients = await db.collection("clients").find(query).toArray()

    return NextResponse.json({ success: true, data: clients })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch clients" }, { status: 500 })
  }
}

// POST create a new client
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already exists
    const existingClient = await db.collection("clients").findOne({ email: data.email })

    if (existingClient) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 })
    }

    const newClient: Client = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("clients").insertOne(newClient)

    return NextResponse.json({ success: true, data: { _id: result.insertedId, ...newClient } }, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ success: false, error: "Failed to create client" }, { status: 500 })
  }
}
