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

  const formData = await request.formData();
  const method = formData.get('_method') as string;

  if (method === 'DELETE') {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.redirect(new URL('/', request.url));
  } else if (method === 'PUT') {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.post.update({
      where: { id: postId },
      data: { title, content },
    });

    return NextResponse.redirect(new URL(`/posts/${postId}`, request.url));
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}