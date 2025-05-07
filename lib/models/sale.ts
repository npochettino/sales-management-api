import type { ObjectId } from "mongodb"

export interface SaleItem {
  productId: ObjectId
  productName: string
  quantity: number
  unitPrice: number
  unitCost: number // Add unit cost to track margins
  subtotal: number
}

export interface PaymentMethod {
  type: "cash" | "credit" | "debit" | "transfer" | "other"
  amount: number
  reference?: string
}

export interface Sale {
  _id?: ObjectId
  clientId: ObjectId
  items: SaleItem[]
  paymentMethods: PaymentMethod[]
  total: number
  totalCost: number // Add total cost for margins
  profit: number // Add profit calculation
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}
