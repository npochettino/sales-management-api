import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getProductPriceHistory } from "@/lib/price-history"

// GET price history for a product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Make sure params.id exists and is valid
    const id = params?.id

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    const priceHistory = await getProductPriceHistory(id)

    return NextResponse.json({ success: true, data: priceHistory })
  } catch (error) {
    console.error("Error fetching price history:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch price history" }, { status: 500 })
  }
}
