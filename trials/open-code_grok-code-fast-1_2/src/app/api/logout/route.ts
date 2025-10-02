import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  if (sessionId) {
    await logoutUser(sessionId);
  }

  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('sessionId', '', { maxAge: 0 });
  return response;
}