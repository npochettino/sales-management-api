import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  cost: z.number().min(0, "Cost must be a positive number").optional().default(0),
  stock: z.number().int().min(0, "Stock must be a positive integer").optional().default(0),
  sku: z.string().optional(),
  categoryId: z.string().optional(),
})

export function validateProduct(data: any) {
  // Convert string values to numbers where needed
  const parsedData = {
    ...data,
    price: data.price ? Number.parseFloat(data.price) : 0,
    cost: data.cost ? Number.parseFloat(data.cost) : 0,
    stock: data.stock ? Number.parseInt(data.stock) : 0,
  }

  return productSchema.safeParse(parsedData)
}
