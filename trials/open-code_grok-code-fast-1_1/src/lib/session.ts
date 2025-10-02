import { cookies } from 'next/headers'
import { findUserById } from './auth'

const SESSION_COOKIE = 'session'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value

  if (!sessionCookie) {
    return null
  }

  try {
    const userId = parseInt(sessionCookie, 10)
    if (isNaN(userId)) {
      return null
    }
    return await findUserById(userId)
  } catch {
    return null
  }
}

export async function setSession(userId: number) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}