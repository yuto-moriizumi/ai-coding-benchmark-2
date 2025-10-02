import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { SessionData } from '@/lib/session'

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_session_security',
  cookieName: 'blog_session',
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Check if route requires authentication
  if (request.nextUrl.pathname === '/new-post') {
    const session = await getIronSession<SessionData>(request, response, sessionOptions)
    
    if (!session.isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/new-post'],
}
