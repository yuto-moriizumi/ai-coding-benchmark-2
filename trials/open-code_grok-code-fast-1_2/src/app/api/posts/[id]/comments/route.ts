import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user';
import { prisma } from '@/lib/db';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const content = formData.get('content') as string;
  if (!content) {
    return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
  }

  await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: user.id,
    },
  });

  return NextResponse.redirect(new URL(`/posts/${postId}`, request.url));
}