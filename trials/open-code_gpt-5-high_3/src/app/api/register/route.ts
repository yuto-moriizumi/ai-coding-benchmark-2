import { NextResponse } from 'next/server';
import { createUser, createSession } from '../../../lib/session';

export async function POST(req: Request) {
  const formData = await req.formData();
  const username = String(formData.get('username')||'').trim();
  const password = String(formData.get('password')||'');
  if(!username || !password) {
    return NextResponse.redirect(new URL('/register?error=1', req.url));
  }
  try {
    const user = await createUser(username, password);
    await createSession(user.id);
    return NextResponse.redirect(new URL('/', req.url));
  } catch(e:any) {
    return NextResponse.redirect(new URL('/register?error=user', req.url));
  }
}
