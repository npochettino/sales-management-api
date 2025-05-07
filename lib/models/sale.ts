import type { ObjectId } from "mongodb"

export interface SaleItem {
  productId: ObjectId
  productName: string
  quantity: number
  unitPrice: number
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
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}
