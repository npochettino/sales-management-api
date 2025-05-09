import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  cost: z.number().min(0, "Cost must be a positive number"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url().optional(),
  priceChangeReason: z.string().optional(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  priceChangeReason: z.string().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
