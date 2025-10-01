import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Username or password is incorrect' },
      { status: 401 }
    )
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return NextResponse.json(
      { error: 'Username or password is incorrect' },
      { status: 401 }
    )
  }

  await createSession(user.id)

  return NextResponse.json({ success: true })
}
