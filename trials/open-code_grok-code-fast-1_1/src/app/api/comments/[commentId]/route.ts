import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ commentId: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { commentId } = await params
    const id = parseInt(commentId, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Find the comment and check ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the comment
    await prisma.comment.update({
      where: { id },
      data: { content: content.trim() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { commentId } = await params
    const id = parseInt(commentId, 10)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the comment and check ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}