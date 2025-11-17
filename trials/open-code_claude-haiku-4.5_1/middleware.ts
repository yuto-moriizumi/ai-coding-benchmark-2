import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./app/lib/auth";

const protectedRoutes = ["/new-post"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if this is a protected route
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      // Redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify token
    const verified = await verifyToken(token);
    if (!verified) {
      // Redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
