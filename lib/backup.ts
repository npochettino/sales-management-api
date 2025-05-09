import { createWriteStream } from "fs"
import { mkdir } from "fs/promises"
import path from "path"
import clientPromise from "@/lib/mongodb"
import { createLogger } from "@/lib/logger"

const logger = createLogger("backup")

export async function backupDatabase() {
  try {
    const client = await clientPromise
    const db = client.db()

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), "backups")
    await mkdir(backupDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/:/g, "-")

    // Get all collections
    const collections = await db.listCollections().toArray()

    for (const collection of collections) {
      const collectionName = collection.name
      const data = await db.collection(collectionName).find({}).toArray()

      if (data.length > 0) {
        const backupPath = path.join(backupDir, `${collectionName}_${timestamp}.json`)
        const writeStream = createWriteStream(backupPath)

        writeStream.write(JSON.stringify(data, null, 2))
        writeStream.end()

        logger.info(`Backup created for collection: ${collectionName}`, { path: backupPath })
      }
    }

    return {
      success: true,
      timestamp,
      message: "Database backup completed successfully",
    }
  } catch (error) {
    logger.error("Database backup failed", error)
    throw error
  }
}
