import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session_userId');

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAppPage =
    !isAuthPage &&
    !['/', '/api'].some(p => pathname.startsWith(p) || p === pathname);
  

  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAppPage && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
