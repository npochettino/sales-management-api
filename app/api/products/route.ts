import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"
import { handleApiError } from "@/lib/error-handler"
import { validateProduct } from "@/lib/validators/product"
import { recordPriceChange } from "@/lib/price-history"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get query parameters
    const url = new URL(req.url)
    const categoryId = url.searchParams.get("categoryId")
    const search = url.searchParams.get("search")

    // Build query
    const query: any = {}

    if (categoryId) {
      query.categoryId = new ObjectId(categoryId)
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ]
    }

    const products = await db.collection("products").find(query).sort({ name: 1 }).toArray()

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const data = await req.json()

    // Validate product data
    const validationResult = validateProduct(data)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    // Get category name if categoryId is provided
    let categoryName = ""
    if (data.categoryId) {
      const category = await db.collection("categories").findOne({
        _id: new ObjectId(data.categoryId),
      })
      if (category) {
        categoryName = category.name
      }
    }

    const newProduct: Omit<Product, "_id"> = {
      name: data.name,
      description: data.description || "",
      price: Number.parseFloat(data.price),
      cost: Number.parseFloat(data.cost || 0),
      stock: Number.parseInt(data.stock || 0),
      sku: data.sku || "",
      categoryId: data.categoryId ? new ObjectId(data.categoryId) : undefined,
      categoryName: categoryName,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("products").insertOne(newProduct)

    // Record initial price history
    await recordPriceChange(
      result.insertedId.toString(),
      null,
      {
        cost: newProduct.cost,
        price: newProduct.price,
      },
      "Initial product creation",
      session.user?.email || "system",
    )

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          ...newProduct,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
