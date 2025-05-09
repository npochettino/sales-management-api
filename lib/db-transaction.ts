import type { ClientSession } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function withTransaction<T>(operation: (session: ClientSession) => Promise<T>): Promise<T> {
  const client = await clientPromise
  const session = client.startSession()

  try {
    session.startTransaction()
    const result = await operation(session)
    await session.commitTransaction()
    return result
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}
