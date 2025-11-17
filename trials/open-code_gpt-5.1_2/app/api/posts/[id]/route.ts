import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = Number(id);
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = Number(id);
  const { title, content } = await req.json();

  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== Number(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { title, content },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const postId = Number(id);

  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== Number(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.comment.deleteMany({ where: { postId } });
  await prisma.post.delete({ where: { id: postId } });

  return NextResponse.json({ ok: true });
}
