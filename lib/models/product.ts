import type { ObjectId } from "mongodb"

export interface Product {
  _id?: ObjectId
  name: string
  description: string
  cost: number // Purchase/manufacturing cost
  price: number // Selling price
  stock: number
  category: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Interface for the price history record
export interface PriceHistory {
  _id?: ObjectId
  productId: ObjectId
  date: Date
  costBefore?: number | null
  costAfter: number
  priceBefore?: number | null
  priceAfter: number
  reason?: string
  userId?: string // The user who made the change
}
