import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import type { Product, PriceHistory } from "@/lib/models/product"

export async function recordPriceChange(
  productId: ObjectId | string,
  oldProduct: Partial<Product> | null,
  newProduct: Partial<Product>,
  reason?: string,
  userId?: string,
): Promise<void> {
  // Default values for undefined fields
  const oldCost = oldProduct?.cost !== undefined ? oldProduct.cost : null
  const oldPrice = oldProduct?.price !== undefined ? oldProduct.price : null
  const newCost = newProduct.cost !== undefined ? newProduct.cost : 0
  const newPrice = newProduct.price !== undefined ? newProduct.price : 0

  // If both cost and price are the same, no need to record
  if (oldProduct && oldCost === newCost && oldPrice === newPrice) {
    return
  }

  const client = await clientPromise
  const db = client.db()

  const priceHistory: PriceHistory = {
    productId: typeof productId === "string" ? new ObjectId(productId) : productId,
    date: new Date(),
    costBefore: oldCost,
    costAfter: newCost,
    priceBefore: oldPrice,
    priceAfter: newPrice,
    reason,
    userId,
  }

  await db.collection("price_history").insertOne(priceHistory)
}

export async function getProductPriceHistory(productId: ObjectId | string): Promise<PriceHistory[]> {
  const client = await clientPromise
  const db = client.db()

  const id = typeof productId === "string" ? new ObjectId(productId) : productId

  return db.collection("price_history").find({ productId: id }).sort({ date: -1 }).toArray() as Promise<PriceHistory[]>
}
