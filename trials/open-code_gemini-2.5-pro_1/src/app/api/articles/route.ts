import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const articles = await prisma.article.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const { title, content } = await request.json();
  const article = await prisma.article.create({
    data: {
      title,
      content,
    },
  });
  return NextResponse.json(article);
}
