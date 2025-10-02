import { NextResponse } from 'next/server';
import { destroySession } from '../../lib/session';

export async function POST() {
  await destroySession();
  return NextResponse.redirect(new URL('/', process.env.APP_URL || 'http://localhost:3000'));
}
