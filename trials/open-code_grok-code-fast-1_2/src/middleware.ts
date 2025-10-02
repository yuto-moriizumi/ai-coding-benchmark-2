import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserBySessionId } from '@/lib/session';

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('sessionId')?.value;
  const user = sessionId ? await getUserBySessionId(sessionId) : null;

  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/api/') || pathname.startsWith('/posts/')) {
    return NextResponse.next();
  }

  // Protected routes
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};