import { NextResponse } from 'next/server';
import { authenticate, createSession } from '../../../lib/session';

export async function POST(req: Request) {
  const formData = await req.formData();
  const username = String(formData.get('username')||'').trim();
  const password = String(formData.get('password')||'');
  const user = await authenticate(username, password);
  if(!user){
    return NextResponse.redirect(new URL('/login?error=1', req.url));
  }
  await createSession(user.id);
  return NextResponse.redirect(new URL('/', req.url));
}
