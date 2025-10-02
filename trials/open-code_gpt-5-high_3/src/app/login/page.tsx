import { authenticate, createSession } from '../../lib/session';
import { redirect } from 'next/navigation';

async function login(formData: FormData) {
  'use server';
  const username = String(formData.get('username')||'').trim();
  const password = String(formData.get('password')||'');
  const user = await authenticate(username, password);
  if(!user) return { error: 'Username or password is incorrect' };
  await createSession(user.id);
  redirect('/');
}

import { headers } from 'next/headers';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const error = sp.error ? 'Username or password is incorrect' : null;
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl mb-4">Login</h1>
      {error && <p className="text-red-600" role="alert">{error}</p>}
      <form action="/api/login" method="post" className="flex flex-col gap-2">
        <label>Username<input name="username" className="border p-1" /></label>
        <label>Password<input name="password" type="password" className="border p-1" /></label>
        <button type="submit" className="bg-blue-500 text-white px-3 py-1">Login</button>
      </form>
    </div>
  );
}
