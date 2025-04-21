import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Consider moving these to lib/constants/routes.ts for better organization
const requireAuth: string[] = [
  "/chat",
  "/api", // Note: sub-routes like /api/chat/public are handled separately
  "/reporting",
  // "/unauthorized", // This page should be accessible if redirected there
  "/persona",
  "/prompt",
  "/extensions" // Added extensions here based on original requireAdmin
];
const requireAdmin: string[] = ["/reporting", "/prompt", "/persona", "/extensions"];
const publicRoutes: string[] = ["/", "/login", "/admin-auth", "/public-chat"]; // Keep original login/admin-auth for potential direct links
const publicApiRoutes: string[] = ["/api/chat/public"];
const authRoutes: string[] = ["/auth/signin", "/auth/signin/dev", "/auth/signin/entra", "/auth/signin/admin", "/auth/signout", "/auth/error"]; // Specific auth flow pages

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // 1. Allow public routes explicitly
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return res;
  }

  // 2. Allow public API endpoints explicitly
  if (publicApiRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return res;
  }

  // 3. Allow NextAuth's internal API routes for handling login/logout/session
   if (pathname.startsWith("/api/auth/")) {
     return res; // Essential for NextAuth functionality
   }

  // 4. Allow our custom authentication flow pages (sign in, error, etc.)
   if (authRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`)) || pathname === "/unauthorized") {
      // These pages handle their own logic or display information,
      // no token check needed *at the middleware level*.
      // The specific page components might do checks (e.g., admin page).
      return res;
   }


  // 5. Check authentication for protected routes
  if (requireAuth.some((path) => pathname.startsWith(path))) {
    const token = await getToken({
      req: request,
      // Ensure you have NEXTAUTH_SECRET set in your environment
      // secret: process.env.NEXTAUTH_SECRET, // Uncomment if needed, though usually inferred
    });

    // Redirect to login if not authenticated
    if (!token) {
      // Preserve the intended destination for redirection after login
      const url = new URL(`/auth/signin`, request.url); // Redirect to the main sign-in selector
      // url.searchParams.set("callbackUrl", request.nextUrl.href); // Optional: Add callbackUrl
      console.log(`[Middleware] No token for ${pathname}, redirecting to login.`);
      return NextResponse.redirect(url);
    }

    // Check admin privileges if required for the route
    if (requireAdmin.some((path) => pathname.startsWith(path))) {
      // @ts-ignore - Assuming isAdmin property exists on the token based on auth config
      if (!token.isAdmin) {
        const url = new URL(`/unauthorized`, request.url);
        console.log(`[Middleware] No admin privileges for ${pathname}, rewriting to unauthorized.`);
        // Rewrite to show unauthorized page without changing URL visibly
        return NextResponse.rewrite(url);
      }
    }
  }

  // Default: Allow the request to proceed if none of the above conditions met
  return res;
}

// Updated Matcher: Includes new auth routes and ensures api/auth is excluded
// Middleware is NOT applied to api/auth/** itself as this is required for logon.
export const config = {
  matcher: [
    /* Public & Auth Flow Routes (explicitly handled above, but matcher ensures middleware runs) */
    "/login",
    "/admin-auth",
    "/public-chat/:path*",
    "/auth/signin/:path*", // Covers /auth/signin and its sub-routes
    "/auth/signout",
    "/auth/error",
    "/unauthorized", // Page itself should be reachable

    /* Protected Routes */
    "/chat/:path*",
    "/reporting/:path*",
    "/prompt/:path*",
    "/persona/:path*",
    "/extensions/:path*",

    /* Protected API Routes (excluding public and auth ones) */
    "/api/chat/:path*", // Excludes /api/chat/public (handled above)
    "/api/images/:path*",
    // Add other protected /api routes here if necessary
    // "/api/((?!auth|chat/public).*)", // More complex regex alternative if needed

    /* Root needs check if not explicitly public */
     // "/" // Covered by publicRoutes check, but can include if needed
  ],
};