import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log("Middleware checking path:", path);

  // Define protected paths
  const isProtectedPath = path.startsWith("/api/") && !path.startsWith("/api/auth/");

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  console.log("Checking authentication for protected path:", path);
  console.log("Request cookies:", request.cookies.getAll().map(c => c.name));
  
  // The secret should match the one in your NextAuth config
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  console.log("Token found:", !!token);
  if (token) {
    console.log("Token subject:", token.sub);
  }

  // If the user is not authenticated
  if (!token) {
    console.log("No token found, returning 401");
    return new NextResponse(JSON.stringify({ success: false, message: "Authentication required" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  console.log("Authentication successful, proceeding to API");
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};