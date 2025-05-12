import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Loading products...</h3>
      <p className="text-gray-500 mt-2">Please wait while we fetch your product data</p>
    </div>
  )
}
