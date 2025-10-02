import { createUser, createSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import { redirect } from 'next/navigation';

async function register(formData: FormData) {
  'use server';
  const username = String(formData.get('username')||'').trim();
  const password = String(formData.get('password')||'');
  if(!username || !password) return { error: 'Missing fields' };
  try {
    const user = await createUser(username, password);
    await createSession(user.id);
    redirect('/');
  } catch(e:any) {
    return { error: e.message || 'Registration failed' };
  }
}

import { headers } from 'next/headers';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const param = sp.error;
  let error: string | null = null;
  if(param === 'user') error = 'User already exists';
  else if(param) error = 'Registration failed';
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl mb-4">Register</h1>
      {error && <p className="text-red-600" role="alert">{error}</p>}
      <form action="/api/register" method="post" className="flex flex-col gap-2">
        <label>Username<input name="username" className="border p-1" /></label>
        <label>Password<input name="password" type="password" className="border p-1" /></label>
        <button type="submit" className="bg-blue-500 text-white px-3 py-1">Register</button>
      </form>
    </div>
  );
}
