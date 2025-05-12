import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import clientPromise from "@/lib/mongodb"
import { type Category, defaultCategories } from "@/lib/models/category"
import { handleApiError } from "@/lib/error-handler"
import { createLogger } from "@/lib/logger"

const logger = createLogger("categories-api")

// Initialize default categories if none exist
async function initializeDefaultCategories() {
  try {
    const client = await clientPromise
    const db = client.db()
    const count = await db.collection("categories").countDocuments()

    if (count === 0) {
      logger.info("Initializing default product categories")
      const categoriesToInsert = defaultCategories.map((category) => ({
        ...category,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      await db.collection("categories").insertMany(categoriesToInsert)
      logger.info(`Initialized ${categoriesToInsert.length} default categories`)
    }
  } catch (error) {
    logger.error("Failed to initialize default categories", { error })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Initialize default categories if none exist
    await initializeDefaultCategories()

    const categories = await db.collection("categories").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const data = await req.json()

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ success: false, message: "Category name is required" }, { status: 400 })
    }

    const newCategory: Omit<Category,"_id"> = {
      name: data.name,
      description: data.description || "",
      color: data.color || "#6B7280", // Default gray color
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("categories").insertOne(newCategory)

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          ...newCategory,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
