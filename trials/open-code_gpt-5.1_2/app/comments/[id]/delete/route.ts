import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const commentId = Number(id);

  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== Number(userId)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return NextResponse.redirect(new URL(`/posts/${comment.postId}`, req.url));
}
