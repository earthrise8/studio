import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth_session');

  const { pathname } = request.nextUrl;

  // If user is authenticated and tries to access login/signup, redirect to dashboard
  if (sessionCookie && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and tries to access a protected route, redirect to login
  if (!sessionCookie && pathname.startsWith('/dashboard') || pathname.startsWith('/pantry') || pathname.startsWith('/logs') || pathname.startsWith('/recipes') || pathname.startsWith('/ai-recipes') || pathname.startsWith('/advisor') || pathname.startsWith('/awards') || pathname.startsWith('/settings')) {
    return NextResponse.redirect(new URL('/login', request.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
