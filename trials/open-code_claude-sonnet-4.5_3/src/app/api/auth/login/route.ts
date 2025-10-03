import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    const user = await prisma.user.findUnique({
      where: { username }
    })
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json(
        { error: 'Username or password is incorrect' },
        { status: 401 }
      )
    }
    
    const response = NextResponse.json({ success: true })
    response.cookies.set('userId', user.id.toString(), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })
    
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
