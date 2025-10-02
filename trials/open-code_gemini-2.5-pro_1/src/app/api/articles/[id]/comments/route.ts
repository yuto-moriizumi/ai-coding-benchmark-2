import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { content } = await request.json();
  const comment = await prisma.comment.create({
    data: {
      content,
      articleId: Number(params.id),
    },
  });
  return NextResponse.json(comment);
}
