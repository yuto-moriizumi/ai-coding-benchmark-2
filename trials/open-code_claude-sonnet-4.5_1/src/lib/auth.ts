import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value
  
  if (!sessionId) return null
  
  const user = await prisma.user.findUnique({
    where: { id: parseInt(sessionId) }
  })
  
  return user
}

export async function createSession(userId: number) {
  const cookieStore = await cookies()
  cookieStore.set('session', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
