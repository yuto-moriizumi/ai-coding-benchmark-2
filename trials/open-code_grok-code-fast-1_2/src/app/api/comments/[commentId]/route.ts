import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { prisma } from '@/lib/db';

interface Params {
  params: Promise<{ commentId: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { commentId } = await params;
  const commentIdNum = parseInt(commentId);
  if (isNaN(commentIdNum)) {
    return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
  }

  const formData = await request.formData();
  const method = formData.get('_method') as string;

  if (method === 'DELETE') {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentIdNum },
    });

    if (!comment || comment.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.comment.delete({
      where: { id: commentIdNum },
    });

    return NextResponse.redirect(new URL(`/posts/${comment.postId}`, request.url));
  } else if (method === 'PUT') {
    const content = formData.get('content') as string;
    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentIdNum },
    });

    if (!comment || comment.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.comment.update({
      where: { id: commentIdNum },
      data: { content },
    });

    return NextResponse.redirect(new URL(`/posts/${comment.postId}`, request.url));
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}