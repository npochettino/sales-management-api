import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET a single sale by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid sale ID" }, { status: 400 })
    }

    const sale = await db.collection("sales").findOne({ _id: new ObjectId(params.id) })

    if (!sale) {
      return NextResponse.json({ success: false, error: "Sale not found" }, { status: 404 })
    }

    // Get client details
    const clientDetails = await db.collection("clients").findOne({ _id: sale.clientId })

    return NextResponse.json({
      success: true,
      data: { ...sale, client: clientDetails },
    })
  } catch (error) {
    console.error("Error fetching sale:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sale" }, { status: 500 })
  }
}

// PUT update a sale (only status can be updated)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid sale ID" }, { status: 400 })
    }

    const data = await request.json()

    // Only allow status updates
    if (!data.status) {
      return NextResponse.json({ success: false, error: "Only status can be updated" }, { status: 400 })
    }

    const updateData = {
      status: data.status,
      updatedAt: new Date(),
    }

    const result = await db.collection("sales").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { _id: params.id, ...updateData },
    })
  } catch (error) {
    console.error("Error updating sale:", error)
    return NextResponse.json({ success: false, error: "Failed to update sale" }, { status: 500 })
  }
}

// DELETE a sale (only if it's in pending status)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const mongoClient = await clientPromise
  const db = mongoClient.db()
  const session = mongoClient.startSession()

  try {
    session.startTransaction()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid sale ID" }, { status: 400 })
    }

    // Get the sale
    const sale = await db.collection("sales").findOne({ _id: new ObjectId(params.id) }, { session })

    if (!sale) {
      await session.abortTransaction()
      return NextResponse.json({ success: false, error: "Sale not found" }, { status: 404 })
    }

    // Only allow deletion of pending sales
    if (sale.status !== "pending") {
      await session.abortTransaction()
      return NextResponse.json(
        {
          success: false,
          error: "Only pending sales can be deleted",
        },
        { status: 400 },
      )
    }

    // Restore product stock
    for (const item of sale.items) {
      await db
        .collection("products")
        .updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }, { session })
    }

    // Delete the sale
    const result = await db.collection("sales").deleteOne({ _id: new ObjectId(params.id) }, { session })

    await session.commitTransaction()

    return NextResponse.json({
      success: true,
      message: "Sale deleted successfully",
    })
  } catch (error) {
    await session.abortTransaction()
    console.error("Error deleting sale:", error)
    return NextResponse.json({ success: false, error: "Failed to delete sale" }, { status: 500 })
  } finally {
    await session.endSession()
  }
}
