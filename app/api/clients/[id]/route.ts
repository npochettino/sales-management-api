import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET a single client by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid client ID" }, { status: 400 })
    }

    const clientData = await db.collection("clients").findOne({ _id: new ObjectId(params.id) })

    if (!clientData) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: clientData })
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch client" }, { status: 500 })
  }
}

// PUT update a client
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid client ID" }, { status: 400 })
    }

    const data = await request.json()

    // Check if email is being changed and already exists
    if (data.email) {
      const existingClient = await db.collection("clients").findOne({
        email: data.email,
        _id: { $ne: new ObjectId(params.id) },
      })

      if (existingClient) {
        return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 })
      }
    }

    const updateData = {
      ...data,
      updatedAt: new Date(),
    }

    const result = await db.collection("clients").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { _id: params.id, ...updateData },
    })
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ success: false, error: "Failed to update client" }, { status: 500 })
  }
}

// DELETE a client
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid client ID" }, { status: 400 })
    }

    // Check if client has any sales
    const salesCount = await db.collection("sales").countDocuments({ clientId: new ObjectId(params.id) })

    if (salesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete client with associated sales",
        },
        { status: 400 },
      )
    }

    const result = await db.collection("clients").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ success: false, error: "Failed to delete client" }, { status: 500 })
  }
}
