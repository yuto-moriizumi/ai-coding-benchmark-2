import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setUserSession, getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  const params = await searchParams;

  async function register(formData: FormData) {
    'use server';
    
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      redirect('/register?error=Username and password are required');
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      redirect('/register?error=User already exists');
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        password
      }
    });

    await setUserSession(newUser.id);
    revalidatePath('/');
    redirect('/');
  }

  return (
    <div style={{maxWidth: '28rem', margin: '2rem auto'}}>
      <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>Register</h1>
      {params.error && (
        <div className="error">
          {params.error}
        </div>
      )}
      <form action={register}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
          />
        </div>
        <button type="submit" className="btn" style={{width: '100%'}}>
          Register
        </button>
      </form>
    </div>
  );
}
