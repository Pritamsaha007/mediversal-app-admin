import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("adminToken")?.value ||
    request.headers.get("authorization");

  const isLoggedIn = !!token;
  const isAuthRoute = request.nextUrl.pathname.startsWith("/");

  if (!isLoggedIn && !isAuthRoute) {
    // Not logged in and trying to access a protected route
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isLoggedIn && isAuthRoute) {
    // Already logged in but trying to access login page
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
