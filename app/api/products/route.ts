import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"

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
    if (!data.name || !data.price || data.stock === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const newProduct: Product = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("products").insertOne(newProduct)

    return NextResponse.json({ success: true, data: { _id: result.insertedId, ...newProduct } }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}
