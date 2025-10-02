'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { setUserCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function register(prevState: { error: string }, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const existingUser = await prisma.user.findUnique({
    where: { username },
  })

  if (existingUser) {
    return { error: 'User already exists' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  })

  await setUserCookie(user.id)
  redirect('/')
}
