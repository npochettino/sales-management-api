import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// GET dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Get total products
    const totalProducts = await db.collection("products").countDocuments()

    // Get products with low stock
    const lowStockProducts = await db
      .collection("products")
      .find({ stock: { $lt: 10 } })
      .limit(5)
      .toArray()

    // Get total clients
    const totalClients = await db.collection("clients").countDocuments()

    // Get recent sales
    const recentSales = await db.collection("sales").find().sort({ createdAt: -1 }).limit(5).toArray()

    // Get sales statistics
    const today = new Date()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0))

    const todaySales = await db
      .collection("sales")
      .find({ createdAt: { $gte: startOfToday } })
      .toArray()

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0)

    // Get monthly revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const monthlySales = await db
      .collection("sales")
      .find({ createdAt: { $gte: startOfMonth } })
      .toArray()

    const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.total, 0)

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        totalClients,
        recentSales,
        todaySalesCount: todaySales.length,
        todayRevenue,
        monthlySalesCount: monthlySales.length,
        monthlyRevenue,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
