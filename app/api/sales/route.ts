import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Sale, SaleItem } from "@/lib/models/sale"

// GET all sales
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    const searchParams = request.nextUrl.searchParams
    const query: any = {}

    // Add filters if provided
    if (searchParams.has("clientId") && ObjectId.isValid(searchParams.get("clientId")!)) {
      query.clientId = new ObjectId(searchParams.get("clientId")!)
    }

    if (searchParams.has("status")) {
      query.status = searchParams.get("status")
    }

    // Date range filter
    if (searchParams.has("startDate")) {
      query.createdAt = query.createdAt || {}
      query.createdAt.$gte = new Date(searchParams.get("startDate")!)
    }

    if (searchParams.has("endDate")) {
      query.createdAt = query.createdAt || {}
      query.createdAt.$lte = new Date(searchParams.get("endDate")!)
    }

    const sales = await db.collection("sales").find(query).toArray()

    return NextResponse.json({ success: true, data: sales })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch sales" }, { status: 500 })
  }
}

// POST create a new sale
export async function POST(request: NextRequest) {
  const session = await clientPromise
  const db = session.db()

  // Start a session for transaction
  const mongoClient = await clientPromise
  const mongoSession = mongoClient.startSession()

  try {
    mongoSession.startTransaction()

    const data = await request.json()

    // Validate required fields
    if (
      !data.clientId ||
      !Array.isArray(data.items) ||
      data.items.length === 0 ||
      !Array.isArray(data.paymentMethods) ||
      data.paymentMethods.length === 0
    ) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate client exists
    if (!ObjectId.isValid(data.clientId)) {
      return NextResponse.json({ success: false, error: "Invalid client ID" }, { status: 400 })
    }

    const client = await db
      .collection("clients")
      .findOne({ _id: new ObjectId(data.clientId) }, { session: mongoSession })

    if (!client) {
      await mongoSession.abortTransaction()
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
    }

    // Process items and check stock
    const processedItems: SaleItem[] = []
    let total = 0

    for (const item of data.items) {
      if (!ObjectId.isValid(item.productId)) {
        await mongoSession.abortTransaction()
        return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 })
      }

      const product = await db
        .collection("products")
        .findOne({ _id: new ObjectId(item.productId) }, { session: mongoSession })

      if (!product) {
        await mongoSession.abortTransaction()
        return NextResponse.json({ success: false, error: `Product not found: ${item.productId}` }, { status: 404 })
      }

      if (product.stock < item.quantity) {
        await mongoSession.abortTransaction()
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for product: ${product.name}`,
          },
          { status: 400 },
        )
      }

      const subtotal = product.price * item.quantity

      processedItems.push({
        productId: new ObjectId(item.productId),
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal,
      })

      total += subtotal

      // Update product stock
      await db
        .collection("products")
        .updateOne(
          { _id: new ObjectId(item.productId) },
          { $inc: { stock: -item.quantity } },
          { session: mongoSession },
        )
    }

    // Validate payment methods total matches sale total
    const paymentTotal = data.paymentMethods.reduce((sum: number, method: { amount: number }) => sum + method.amount, 0)

    if (Math.abs(paymentTotal - total) > 0.01) {
      // Allow for small rounding errors
      await mongoSession.abortTransaction()
      return NextResponse.json(
        {
          success: false,
          error: `Payment total (${paymentTotal}) does not match sale total (${total})`,
        },
        { status: 400 },
      )
    }

    // Create the sale
    const newSale: Sale = {
      clientId: new ObjectId(data.clientId),
      items: processedItems,
      paymentMethods: data.paymentMethods,
      total,
      status: data.status || "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("sales").insertOne(newSale, { session: mongoSession })

    await mongoSession.commitTransaction()

    return NextResponse.json({ success: true, data: { _id: result.insertedId, ...newSale } }, { status: 201 })
  } catch (error) {
    await mongoSession.abortTransaction()
    console.error("Error creating sale:", error)
    return NextResponse.json({ success: false, error: "Failed to create sale" }, { status: 500 })
  } finally {
    await mongoSession.endSession()
  }
}
