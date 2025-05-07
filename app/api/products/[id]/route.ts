import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { recordPriceChange, getProductPriceHistory } from "@/lib/price-history"

// GET a single product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    const product = await db.collection("products").findOne({ _id: new ObjectId(params.id) })

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    // Check if we should include price history
    const includeHistory = request.nextUrl.searchParams.get("includeHistory") === "true"

    if (includeHistory) {
      const priceHistory = await getProductPriceHistory(params.id)
      return NextResponse.json({
        success: true,
        data: {
          ...product,
          priceHistory,
        },
      })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 })
  }
}

// PUT update a product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    // Get the current product data for price history
    const currentProduct = await db.collection("products").findOne({ _id: new ObjectId(params.id) })

    if (!currentProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    const data = await request.json()

    // Prepare update data
    const updateData = {
      ...data,
      updatedAt: new Date(),
    }

    // Convert numeric fields
    if (data.price !== undefined) updateData.price = Number(data.price)
    if (data.cost !== undefined) updateData.cost = Number(data.cost)
    if (data.stock !== undefined) updateData.stock = Number(data.stock)

    // Check if price or cost is being updated
    const priceOrCostChanged =
      (data.price !== undefined && data.price != currentProduct.price) ||
      (data.cost !== undefined && data.cost != currentProduct.cost)

    const result = await db.collection("products").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    // Record price history if price or cost changed
    if (priceOrCostChanged) {
      await recordPriceChange(
        params.id,
        { cost: currentProduct.cost, price: currentProduct.price },
        {
          cost: data.cost !== undefined ? Number(data.cost) : currentProduct.cost,
          price: data.price !== undefined ? Number(data.price) : currentProduct.price,
        },
        data.priceChangeReason || "Product update",
        request.headers.get("user-id") || undefined,
      )
    }

    return NextResponse.json({
      success: true,
      data: { _id: params.id, ...updateData },
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE a product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db()

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    const result = await db.collection("products").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 })
  }
}
