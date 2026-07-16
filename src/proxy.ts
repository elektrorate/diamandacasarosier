import { getActivePublicRedirects } from "@/lib/cms/public-redirects";
import { resolvePublicRedirect } from "@/lib/cms/redirect-routing";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isPrefetchRequest(request: NextRequest) {
  const purpose = request.headers.get("purpose") || request.headers.get("sec-purpose") || "";
  return request.headers.has("next-router-prefetch") || purpose.toLowerCase().includes("prefetch");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    if (isPrefetchRequest(request)) return new NextResponse(null, { status: 204 });
    if (pathname === "/admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    if (pathname === "/admin/login") return NextResponse.redirect(new URL("/auth", request.url));
    return NextResponse.next();
  }

  try {
    const resolved = resolvePublicRedirect(request.nextUrl, await getActivePublicRedirects());
    if (resolved) return NextResponse.redirect(resolved.url, resolved.status);
  } catch (error) {
    console.error("No se pudo resolver la redirección pública:", error);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf|pdf)$).*)"],
};
