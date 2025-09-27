
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth_session');

  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/signup', '/signup-success', '/forgot-password'];

  // If user is authenticated and tries to access a public page, redirect to dashboard
  if (sessionCookie && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and tries to access a protected route, do nothing.
  // The page components will handle showing appropriate content.
  if (!sessionCookie && !publicPaths.includes(pathname) && !pathname.startsWith('/_next') && pathname !== '/') {
    // No longer redirecting automatically.
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (the landing page is public)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|$).*)',
  ],
};
