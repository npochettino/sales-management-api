"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createLogger } from "@/lib/logger"

const logger = createLogger("error-boundary")

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      logger.error("Unhandled error caught by ErrorBoundary", error.error)
      setError(error.error)
      setHasError(true)
    }

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      logger.error("Unhandled promise rejection caught by ErrorBoundary", event.reason)
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)))
      setHasError(true)
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [])

  if (hasError) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">We're sorry, but an error occurred while rendering this page.</p>
            {error && (
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <p className="text-sm text-red-800">{error.message}</p>
              </div>
            )}
            <button
              onClick={() => {
                setHasError(false)
                setError(null)
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
