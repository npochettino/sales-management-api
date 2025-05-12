import type { ObjectId } from "mongodb"

export interface Category {
  _id?: ObjectId | string
  name: string
  description?: string
  color?: string
  createdAt: Date
  updatedAt: Date
}

export const defaultCategories = [
  { name: "Electronics", color: "#3B82F6", description: "Electronic devices and accessories" },
  { name: "Clothing", color: "#10B981", description: "Apparel and fashion items" },
  { name: "Home & Kitchen", color: "#F59E0B", description: "Home goods and kitchen supplies" },
  { name: "Office Supplies", color: "#6366F1", description: "Office equipment and supplies" },
  { name: "Food & Beverages", color: "#EC4899", description: "Consumable food and drink items" },
  { name: "Other", color: "#6B7280", description: "Miscellaneous items" },
]
