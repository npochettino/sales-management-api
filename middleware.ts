import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 100 // Maximum requests per window

// In-memory store for rate limiting
// Note: This will be reset when the server restarts
// For production, use Redis or another persistent store
const rateLimitStore: Record<string, { count: number; timestamp: number }> = {}

// Clean up the rate limit store periodically
setInterval(() => {
  const now = Date.now()
  for (const key in rateLimitStore) {
    if (now - rateLimitStore[key].timestamp > RATE_LIMIT_WINDOW) {
      delete rateLimitStore[key]
    }
  }
}, RATE_LIMIT_WINDOW)

export async function middleware(request: NextRequest) {
  // Skip rate limiting for static assets
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/static") ||
    request.nextUrl.pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // Rate limiting
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  const key = `${clientIp}:${request.nextUrl.pathname}`
  const now = Date.now()

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { count: 0, timestamp: now }
  }

  // Reset count if window has passed
  if (now - rateLimitStore[key].timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore[key] = { count: 0, timestamp: now }
  }

  rateLimitStore[key].count++

  if (rateLimitStore[key].count > MAX_REQUESTS_PER_WINDOW) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": MAX_REQUESTS_PER_WINDOW.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": (Math.ceil(rateLimitStore[key].timestamp / 1000) + RATE_LIMIT_WINDOW / 1000).toString(),
        },
      },
    )
  }

  // Authentication check for protected routes
  if (
    request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.startsWith("/api/auth") &&
    !request.nextUrl.pathname.startsWith("/api/health")
  ) {
    const token = await getToken({ req: request })

    if (!token) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
          message: "Authentication required",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }
  }

  // Dashboard routes protection
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = await getToken({ req: request })

    if (!token) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
