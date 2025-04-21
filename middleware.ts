import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const requireAuth: string[] = [
  "/chat",
  "/api",
  "/reporting",
  "/unauthorized",
  "/persona",
  "/prompt"
];
const requireAdmin: string[] = ["/reporting", "/prompt", "/persona", "/extensions"];
const publicRoutes: string[] = ["/", "/login", "/admin-auth", "/public-chat"];
const publicApiRoutes: string[] = ["/api/chat/public"];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Allow public routes without authentication check
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return res;
  }
  
  // Allow public API endpoints without authentication
  if (publicApiRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return res;
  }

  if (requireAuth.some((path) => pathname.startsWith(path))) {
    const token = await getToken({
      req: request,
    });

    //check not logged in
    if (!token) {
      const url = new URL(`/login`, request.url);
      return NextResponse.redirect(url);
    }

    if (requireAdmin.some((path) => pathname.startsWith(path))) {
      //check if not authorized
      if (!token.isAdmin) {
        const url = new URL(`/unauthorized`, request.url);
        return NextResponse.rewrite(url);
      }
    }
  }

  return res;
}

// note that middleware is not applied to api/auth as this is required to logon (i.e. requires anon access)
export const config = {
  matcher: [
    "/unauthorized/:path*",
    "/reporting/:path*",
    "/api/chat:path*",
    "/api/images:path*",
    "/chat/:path*",
    "/login",
    "/admin-auth",
    "/prompt/:path*",
    "/persona/:path*",
    "/extensions/:path*",
    "/public-chat/:path*"
  ],
};
