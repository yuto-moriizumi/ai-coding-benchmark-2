import { loginUser } from '../../lib/auth';
import { redirect } from 'next/navigation';

async function login(formData: FormData) {
  'use server';
  const username = String(formData.get('username')||'').trim();
  const password = String(formData.get('password')||'');
  const res = await loginUser(username, password);
  if (res.error) redirect('/login?error=' + encodeURIComponent(res.error));
  redirect('/');
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <div>
      <h1>Login</h1>
      <form action={login}>
        <label>Username<input name="username" aria-label="Username" /></label><br />
        <label>Password<input type="password" name="password" aria-label="Password" /></label><br />
        <button type="submit">Login</button>
      </form>
      {sp?.error && <p>{sp.error}</p>}
    </div>
  );
}