import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

// Very small auth helper using cookie with user id
const SESSION_COOKIE = 'session_user_id';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const id = cookieStore.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const userId = parseInt(id, 10);
  if (Number.isNaN(userId)) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function registerUser(username: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: 'User already exists' };
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, password: hashed } });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, String(user.id));
  return { user };
}

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: 'Username or password is incorrect' };
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return { error: 'Username or password is incorrect' };
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, String(user.id));
  return { user };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
