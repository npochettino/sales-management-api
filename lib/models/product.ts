import type { ObjectId } from "mongodb"

export interface Product {
  _id?: ObjectId | string
  name: string
  description?: string
  price: number
  cost: number
  stock: number
  sku?: string
  categoryId?: ObjectId | string
  categoryName?: string // For easier access without joins
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Interface for the price history record
export interface PriceHistory {
  _id?: ObjectId
  productId: ObjectId | string
  date: Date
  costBefore?: number
  costAfter: number
  priceBefore?: number
  priceAfter: number
  reason?: string
  userId?: string // The user who made the change
}

/**
 * Calculates the profit margin percentage of a product
 * Formula: ((Price - Cost) / Price) * 100
 *
 * @param product The product to calculate margin for
 * @returns The margin as a percentage, rounded to 2 decimal places
 */
export function calculateMargin(product: Product): number {
  // Handle edge cases: missing price/cost or zero price
  if (!product || typeof product.price !== "number" || typeof product.cost !== "number" || product.price <= 0) {
    return 0
  }

  // Calculate margin percentage
  const margin = ((product.price - product.cost) / product.price) * 100

  // Round to 2 decimal places and handle NaN
  return isNaN(margin) ? 0 : Math.round(margin * 100) / 100
}

/**
 * Calculates the profit amount for a product
 *
 * @param product The product to calculate profit for
 * @returns The profit amount (price - cost)
 */
export function calculateProfit(product: Product): number {
  if (!product || typeof product.price !== "number" || typeof product.cost !== "number") {
    return 0
  }

  const profit = product.price - product.cost
  return isNaN(profit) ? 0 : Math.round(profit * 100) / 100
}
