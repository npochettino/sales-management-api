import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"
import { recordPriceChange } from "@/lib/price-history"

// GET all products
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    const searchParams = request.nextUrl.searchParams
    const query: any = {}

    // Add filters if provided
    if (searchParams.has("category")) {
      query.category = searchParams.get("category")
    }

    // Add stock filter
    if (searchParams.has("inStock")) {
      query.stock = { $gt: 0 }
    }

    const products = await db.collection("products").find(query).toArray()

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST create a new product
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    const data = await request.json()

    // Validate required fields
    if (!data.name || data.stock === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const newProduct: Product = {
      ...data,
      price: data.price !== undefined ? Number.parseFloat(data.price) : 0,
      cost: data.cost !== undefined ? Number.parseFloat(data.cost) : 0,
      stock: Number.parseInt(data.stock),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("products").insertOne(newProduct)

    // Record initial price history (no "before" values for new product)
    await recordPriceChange(
      result.insertedId.toString(),
      null,
      { cost: newProduct.cost, price: newProduct.price },
      "Initial product creation",
      request.headers.get("user-id") || undefined,
    )

    return NextResponse.json({ success: true, data: { _id: result.insertedId, ...newProduct } }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}
