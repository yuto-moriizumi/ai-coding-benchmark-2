'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { setUserCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function login(prevState: { error: string }, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'Username or password is incorrect' }
  }

  await setUserCookie(user.id)
  redirect('/')
}
