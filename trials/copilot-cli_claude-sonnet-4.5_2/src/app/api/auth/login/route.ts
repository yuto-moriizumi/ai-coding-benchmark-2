import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Username or password is incorrect' },
        { status: 401 }
      )
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Username or password is incorrect' },
        { status: 401 }
      )
    }

    // Create session
    const session = await getSession()
    session.userId = user.id
    session.username = user.username
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
