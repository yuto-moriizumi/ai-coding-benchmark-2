import { registerUser } from '../../lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function register(formData: FormData) {
  'use server';
  const username = String(formData.get('username')||'').trim();
  const password = String(formData.get('password')||'');
  if (!username || !password) redirect('/register?error=' + encodeURIComponent('Username and password required'));
  const res = await registerUser(username, password);
  if (res.error) redirect('/register?error=' + encodeURIComponent(res.error));
  redirect('/');
}

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div>
      <h1>Register</h1>
      <form action={register}>
        <label>Username<input name="username" aria-label="Username" /></label><br />
        <label>Password<input type="password" name="password" aria-label="Password" /></label><br />
        <button type="submit">Register</button>
      </form>
      {sp?.error && <p>{sp.error}</p>}
    </div>
  );
}
