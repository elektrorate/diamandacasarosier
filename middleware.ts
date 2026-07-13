import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isPrefetchRequest(request: NextRequest) {
  const purpose = request.headers.get("purpose") || request.headers.get("sec-purpose") || "";
  return request.headers.has("next-router-prefetch") || purpose.toLowerCase().includes("prefetch");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && isPrefetchRequest(request)) {
    return new NextResponse(null, { status: 204 });
  }

  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
