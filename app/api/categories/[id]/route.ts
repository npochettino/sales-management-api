import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { handleApiError } from "@/lib/error-handler"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const category = await db.collection("categories").findOne({
      _id: new ObjectId(params.id),
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const data = await req.json()

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const updateData = {
      name: data.name,
      description: data.description || "",
      color: data.color || "#6B7280",
      updatedAt: new Date(),
    }

    const result = await db.collection("categories").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Update category name in all products with this category
    await db
      .collection("products")
      .updateMany({ categoryId: new ObjectId(params.id) }, { $set: { categoryName: data.name } })

    return NextResponse.json({ _id: params.id, ...updateData })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if category is in use
    const productsWithCategory = await db.collection("products").countDocuments({
      categoryId: new ObjectId(params.id),
    })

    if (productsWithCategory > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category that is assigned to products",
          productsCount: productsWithCategory,
        },
        { status: 400 },
      )
    }

    const result = await db.collection("categories").deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
