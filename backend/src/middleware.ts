import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isProtectedPage = request.nextUrl.pathname.startsWith("/dashboard");

  if (!isProtectedPage) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get("sb-access-token")?.value;

  if (!authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
