import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // Only apply to /admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) {
    return new NextResponse("Server configuration error", { status: 500 });
  }

  const encodedSecret = new TextEncoder().encode(secret);

  // Check for token in query param (initial redirect from platform)
  const tokenParam = request.nextUrl.searchParams.get("token");
  if (tokenParam) {
    try {
      await jwtVerify(tokenParam, encodedSecret);
      // Valid token — set cookie and redirect without token in URL
      const url = request.nextUrl.clone();
      url.searchParams.delete("token");
      const response = NextResponse.redirect(url);
      response.cookies.set("admin_token", tokenParam, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/admin",
        maxAge: 3600, // 1 hour
      });
      return response;
    } catch {
      return new NextResponse("Invalid token", { status: 401 });
    }
  }

  // Check for token in cookie
  const cookieToken = request.cookies.get("admin_token")?.value;
  if (cookieToken) {
    try {
      await jwtVerify(cookieToken, encodedSecret);
      return NextResponse.next();
    } catch {
      // Expired or invalid cookie — clear it
      const response = new NextResponse("Session expired. Please re-open this page from the MadeThis platform.", {
        status: 401,
      });
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return new NextResponse(
    "Unauthorized — access this page from the MadeThis platform.",
    { status: 401 }
  );
}

export const config = {
  matcher: "/admin/:path*",
};
