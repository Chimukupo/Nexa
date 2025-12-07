import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session"); // We'll use this later for session management if needed, but for now client-side auth is primary.
  // Note: Firebase Auth runs client-side. For server-side protection in middleware, 
  // we typically need a session cookie or verify token. 
  // For this phase, we'll do basic path protection and rely on client-side redirection for strict auth.
  // Real middleware protection with Firebase requires setting a session cookie on login.
  
  // For now, we will rely on client-side checks in the layout/pages for "strict" security,
  // and use this middleware for obvious redirections if we had the token.
  
  // Since we are using client-side Firebase Auth, the middleware can't easily check auth status 
  // without a session cookie. 
  // Strategy: 
  // 1. We will use a client-side check in a robust generic component or layout.
  // 2. Or, we can set a cookie on successful login.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login
     * - signup
     * - verify-email
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup|verify-email).*)',
  ],
};

