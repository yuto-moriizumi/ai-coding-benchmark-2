import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const commentId = parseInt(id)
  
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  })

  if (!comment || comment.authorId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { content } = await request.json()

  await prisma.comment.update({
    where: { id: commentId },
    data: { content }
  })

  return NextResponse.json({ success: true })
}
