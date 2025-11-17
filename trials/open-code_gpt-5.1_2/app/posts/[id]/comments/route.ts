import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = Number(id);

  const formData = await req.formData();
  const content = String(formData.get("content") || "");

  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!content) {
    return NextResponse.redirect(new URL(`/posts/${postId}`, req.url));
  }

  await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: Number(userId),
    },
  });

  return NextResponse.redirect(new URL(`/posts/${postId}`, req.url));
}
