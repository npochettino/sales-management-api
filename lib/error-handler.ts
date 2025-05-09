import { NextResponse } from "next/server"

export type AppError = {
  message: string
  code?: string
  status?: number
  details?: any
}

export class ApiError extends Error {
  code: string
  status: number
  details?: any

  constructor(message: string, code = "INTERNAL_ERROR", status = 500, details?: any) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.status = status
    this.details = details
  }

  static badRequest(message: string, code = "BAD_REQUEST", details?: any) {
    return new ApiError(message, code, 400, details)
  }

  static unauthorized(message: string, code = "UNAUTHORIZED", details?: any) {
    return new ApiError(message, code, 401, details)
  }

  static forbidden(message: string, code = "FORBIDDEN", details?: any) {
    return new ApiError(message, code, 403, details)
  }

  static notFound(message: string, code = "NOT_FOUND", details?: any) {
    return new ApiError(message, code, 404, details)
  }

  static conflict(message: string, code = "CONFLICT", details?: any) {
    return new ApiError(message, code, 409, details)
  }

  static serverError(message: string, code = "INTERNAL_ERROR", details?: any) {
    return new ApiError(message, code, 500, details)
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status },
    )
  }

  // Handle MongoDB errors
  if (error instanceof Error && error.name === "MongoServerError") {
    const mongoError = error as any
    if (mongoError.code === 11000) {
      // Duplicate key error
      return NextResponse.json(
        {
          success: false,
          error: "A record with this information already exists",
          code: "DUPLICATE_KEY",
        },
        { status: 409 },
      )
    }
  }

  // Default error response
  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    },
    { status: 500 },
  )
}
