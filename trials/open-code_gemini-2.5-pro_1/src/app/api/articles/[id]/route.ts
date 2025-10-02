import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const article = await prisma.article.findUnique({
    where: { id: Number(params.id) },
    include: { comments: true },
  });
  if (!article) {
    return new Response('Article not found', { status: 404 });
  }
  return NextResponse.json(article);
}
