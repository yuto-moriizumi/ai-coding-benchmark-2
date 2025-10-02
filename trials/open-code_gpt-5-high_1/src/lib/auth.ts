import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'session_user_id';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const id = cookieStore.get(SESSION_COOKIE)?.value;
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  return user;
}

export async function register(username: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error('User already exists');
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, password: hashed } });
  return user;
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error('Username or password is incorrect');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Username or password is incorrect');
  return user;
}

export async function setUserSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, String(userId));
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
