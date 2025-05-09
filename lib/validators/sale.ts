import { z } from "zod"
import { ObjectId } from "mongodb"

// Helper function to validate ObjectId strings
const objectIdString = z.string().refine(
  (val) => {
    try {
      return ObjectId.isValid(val)
    } catch (e) {
      return false
    }
  },
  {
    message: "Invalid ID format",
  },
)

export const createSaleItemSchema = z.object({
  productId: objectIdString,
  quantity: z.number().int().positive("Quantity must be a positive integer"),
})

export const paymentMethodSchema = z.object({
  type: z.enum(["cash", "credit", "debit", "transfer", "mercadopago", "other"]),
  amount: z.number().min(0, "Amount must be a positive number"),
  reference: z.string().optional(),
})

export const createSaleSchema = z.object({
  clientId: objectIdString,
  items: z.array(createSaleItemSchema).min(1, "At least one item is required"),
  paymentMethods: z.array(paymentMethodSchema).min(1, "At least one payment method is required"),
  status: z.enum(["pending", "completed", "cancelled"]).optional().default("completed"),
})

export type CreateSaleInput = z.infer<typeof createSaleSchema>
