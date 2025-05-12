import clientPromise from "./mongodb"
import { createLogger } from "./logger"
import { defaultCategories } from "./models/category"

const logger = createLogger("db-setup")

export async function setupDatabase() {
  try {
    logger.info("Setting up database...")
    const client = await clientPromise
    const db = client.db()

    // Create indexes
    await createIndexes(db)

    // Initialize default data
    await initializeDefaultData(db)

    logger.info("Database setup completed successfully")
  } catch (error) {
    logger.error("Database setup failed", { error })
    throw error
  }
}

async function createIndexes(db: any) {
  try {
    logger.info("Creating database indexes...")

    // Products collection indexes
    await db.collection("products").createIndex({ name: 1 }, { unique: true })
    await db.collection("products").createIndex({ categoryId: 1 })
    await db.collection("products").createIndex({ sku: 1 }, { sparse: true })
    await db.collection("products").createIndex({ stock: 1 })

    // Clients collection indexes
    await db.collection("clients").createIndex({ email: 1 }, { unique: true, sparse: true })
    await db.collection("clients").createIndex({ phone: 1 }, { sparse: true })
    await db.collection("clients").createIndex({ name: "text" })

    // Sales collection indexes
    await db.collection("sales").createIndex({ clientId: 1 })
    await db.collection("sales").createIndex({ date: 1 })
    await db.collection("sales").createIndex({ status: 1 })
    await db.collection("sales").createIndex({ "items.productId": 1 })

    // Categories collection indexes
    await db.collection("categories").createIndex({ name: 1 }, { unique: true })

    logger.info("Database indexes created successfully")
  } catch (error) {
    logger.error("Failed to create database indexes", { error })
    throw error
  }
}

async function initializeDefaultData(db: any) {
  try {
    logger.info("Initializing default data...")

    // Initialize default categories if none exist
    const categoriesCount = await db.collection("categories").countDocuments()
    if (categoriesCount === 0) {
      logger.info("Initializing default categories...")
      const categoriesToInsert = defaultCategories.map((category) => ({
        ...category,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
      await db.collection("categories").insertMany(categoriesToInsert)
      logger.info(`Initialized ${categoriesToInsert.length} default categories`)
    }

    logger.info("Default data initialization completed")
  } catch (error) {
    logger.error("Failed to initialize default data", { error })
    throw error
  }
}
