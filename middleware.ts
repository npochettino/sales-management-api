import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiter
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
  store: new Map(),
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define protected paths
  const isProtectedPath = path.startsWith("/api/") && !path.startsWith("/api/auth/")

  // Rate limiting
  const ip = request.ip || "unknown"
  const now = Date.now()
  const windowStart = now - rateLimit.windowMs

  // Clean up old requests
  for (const [key, timestamp] of rateLimit.store.entries()) {
    if (timestamp < windowStart) {
      rateLimit.store.delete(key)
    }
  }

  // Count requests in current window
  const requestTimestamps = Array.from(rateLimit.store.entries())
    .filter(([key, _]) => key.startsWith(`${ip}:`))
    .map(([_, timestamp]) => timestamp)
    .filter((timestamp) => timestamp > windowStart)

  if (requestTimestamps.length >= rateLimit.max) {
    return new NextResponse(JSON.stringify({ success: false, message: rateLimit.message }), {
      status: 429,
      headers: { "content-type": "application/json" },
    })
  }

  // Record this request
  rateLimit.store.set(`${ip}:${now}`, now)

  if (!isProtectedPath) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request })

  // If the user is not authenticated
  if (!token) {
    return new NextResponse(JSON.stringify({ success: false, message: "Authentication required" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
