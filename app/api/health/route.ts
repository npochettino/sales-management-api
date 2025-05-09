import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { createLogger } from "@/lib/logger"

const logger = createLogger("health-check")

export async function GET() {
  try {
    // Check MongoDB connection
    const client = await clientPromise
    await client.db().command({ ping: 1 })

    // You can add more health checks here (e.g., Redis, external APIs)

    return NextResponse.json({
      status: "healthy",
      services: {
        database: "connected",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Health check failed", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
