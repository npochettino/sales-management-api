"use client"

import { use } from 'react'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"
import type { Product } from "@/lib/models/product"
import { productService } from "@/services/productService"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/product-form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/use-toast"

type ParamsPromise = Promise<{ id: string }>

export default function ProductDetailPage({ params }: { params: ParamsPromise  }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        if (id === "new") {
          setProduct(null)
          setLoading(false)
          return
        }

        const response = await productService.getProduct(id)
        setProduct(response.data)

        // Load price history if needed
        if (response.data._id) {
          try {
            const history = await productService.getPriceHistory(response.data._id.toString())
            setProduct((prev) => (prev ? { ...prev, priceHistory: history } : null))
          } catch (historyError) {
            console.error("Failed to load price history:", historyError)
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product")
        toast({
          title: "Error",
          description: err.message || "Failed to load product",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="flex items-center text-red-500 mb-4">
          <AlertCircle className="mr-2" />
          <span>Error loading product</span>
        </div>
        <Button onClick={() => router.push("/dashboard/products")}>Back to Products</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/products")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
        <h1 className="text-2xl font-bold">{id === "new" ? "Create New Product" : "Edit Product"}</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <ProductForm product={product || undefined} isEdit={id !== "new"} />
      </div>
    </div>
  )
}
