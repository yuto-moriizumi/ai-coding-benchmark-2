import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = Number(id);

  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== Number(userId)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await prisma.comment.deleteMany({ where: { postId } });
  await prisma.post.delete({ where: { id: postId } });

  return NextResponse.redirect(new URL("/", req.url));
}
