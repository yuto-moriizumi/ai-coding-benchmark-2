import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { randomBytes, createHash } from 'crypto';

const COOKIE_NAME = 'session_id';

export async function hashPassword(pw: string) {
  return createHash('sha256').update(pw).digest('hex');
}

export async function createUser(username: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error('User already exists');
  const hashed = await hashPassword(password);
  return prisma.user.create({ data: { username, password: hashed } });
}

export async function authenticate(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  const hashed = await hashPassword(password);
  if (hashed !== user.password) return null;
  return user;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sid = cookieStore.get(COOKIE_NAME)?.value;
  if (!sid) return null;
  const session = await prisma.session.findUnique({ where: { id: sid }, include: { user: true } }).catch(()=>null);
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

export async function createSession(userId: number) {
  const id = randomBytes(16).toString('hex');
  await prisma.session.create({ data: { id, userId } });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, id, { httpOnly: true, path: '/' });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sid = cookieStore.get(COOKIE_NAME)?.value;
  if (sid) {
    await prisma.session.delete({ where: { id: sid } }).catch(()=>{});
    cookieStore.delete(COOKIE_NAME);
  }
}
