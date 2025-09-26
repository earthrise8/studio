import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session_userId');

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // All pages inside /app/* are considered app pages, except auth pages
  const isAppPage = /^\/(\w+)/.test(pathname) && !isAuthPage && pathname !== '/';

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAppPage && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // This matcher is crucial to ensure the middleware only runs on actual page routes
  // and not on Next.js internal paths or static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
