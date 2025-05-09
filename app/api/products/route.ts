import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"
import { recordPriceChange } from "@/lib/price-history"
import { createProductSchema } from "@/lib/validators/product"
import { ApiError, handleApiError } from "@/lib/error-handler"
import { createLogger } from "@/lib/logger"
import { cache } from "@/lib/cache"

const logger = createLogger("products-api")

// GET all products
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    const searchParams = request.nextUrl.searchParams
    const query: any = {}
    const cacheKey = `products:${searchParams.toString()}`

    // Try to get from cache first
    const cachedData = cache.get<Product[]>(cacheKey)
    if (cachedData) {
      logger.info("Returning cached products data")
      return NextResponse.json({ success: true, data: cachedData })
    }

    // Add filters if provided
    if (searchParams.has("category")) {
      query.category = searchParams.get("category")
    }

    // Add stock filter
    if (searchParams.has("inStock")) {
      query.stock = { $gt: 0 }
    }

    const products = await db.collection("products").find(query).toArray()

    // Cache the results for 30 seconds
    cache.set(cacheKey, products, 30)

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    logger.error("Error fetching products", error)
    return handleApiError(error)
  }
}

// POST create a new product
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    const data = await request.json()

    // Validate input data
    const validationResult = createProductSchema.safeParse(data)
    if (!validationResult.success) {
      throw ApiError.badRequest("Invalid product data", "VALIDATION_ERROR", validationResult.error.format())
    }

    const validatedData = validationResult.data

    const newProduct: Product = {
      ...validatedData,
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

    // Invalidate cache
    cache.delete("products:")

    logger.info("Product created", { productId: result.insertedId.toString() })
    return NextResponse.json({ success: true, data: { _id: result.insertedId, ...newProduct } }, { status: 201 })
  } catch (error) {
    logger.error("Error creating product", error)
    return handleApiError(error)
  }
}
