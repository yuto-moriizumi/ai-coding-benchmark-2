import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  
  if (!userId) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: { id: true, username: true }
  });
  
  return user;
}

export async function setUserSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set('userId', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
}
