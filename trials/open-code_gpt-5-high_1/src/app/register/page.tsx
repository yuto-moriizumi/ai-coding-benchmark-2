import { redirect } from 'next/navigation';
import { register, setUserSession, getCurrentUser } from '@/src/lib/auth';

async function registerAction(formData: FormData) {
  'use server';
  const username = (formData.get('username') as string).trim();
  const password = (formData.get('password') as string).trim();
  try {
    const user = await register(username, password);
    await setUserSession(user.id);
    redirect('/');
  } catch (e: any) {
    return { error: e.message };
  }
}

export default async function RegisterPage({ searchParams }: { searchParams: any }) {
  const user = await getCurrentUser();
  if (user) redirect('/');
  const error = searchParams?.error;
  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form action={async (fd) => {
        const res: any = await registerAction(fd);
        if (res?.error) {
          redirect(`/register?error=${encodeURIComponent(res.error)}`);
        }
      }}>
        <label>Username<input name="username" required /></label><br />
        <label>Password<input type="password" name="password" required /></label><br />
        <button type="submit">Register</button>
      </form>
      <a href="/login">Login</a>
    </div>
  );
}
