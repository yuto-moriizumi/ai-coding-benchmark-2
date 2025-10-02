import { NextRequest, NextResponse } from 'next/server'
import { findUserByUsername, verifyPassword } from '@/lib/auth'
import { setSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    // Find user
    const user = await findUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: 'Username or password is incorrect' }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Username or password is incorrect' }, { status: 401 })
    }

    // Set session
    await setSession(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}