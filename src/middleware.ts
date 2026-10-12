import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow landing page and sign-in pages
  if (pathname === "/" || pathname.startsWith("/sign-in")) {
    return NextResponse.next();
  }

  // Protected routes require authentication
  // This is handled by the layout redirect, so we just allow through
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
