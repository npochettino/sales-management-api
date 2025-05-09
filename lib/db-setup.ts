import clientPromise from "@/lib/mongodb"
import { createLogger } from "@/lib/logger"

const logger = createLogger("db-setup")

export async function setupDatabaseIndexes() {
  try {
    const client = await clientPromise
    const db = client.db()

    // Products collection indexes
    await db.collection("products").createIndex({ name: 1 }, { unique: true })
    await db.collection("products").createIndex({ category: 1 })
    await db.collection("products").createIndex({ stock: 1 })

    // Clients collection indexes
    await db.collection("clients").createIndex({ email: 1 }, { unique: true })
    await db.collection("clients").createIndex({ name: 1 })

    // Sales collection indexes
    await db.collection("sales").createIndex({ clientId: 1 })
    await db.collection("sales").createIndex({ status: 1 })
    await db.collection("sales").createIndex({ createdAt: 1 })
    await db.collection("sales").createIndex({ "items.productId": 1 })

    // Price history indexes
    await db.collection("price_history").createIndex({ productId: 1 })
    await db.collection("price_history").createIndex({ date: 1 })

    logger.info("Database indexes setup completed")
  } catch (error) {
    logger.error("Error setting up database indexes", error)
    throw error
  }
}
