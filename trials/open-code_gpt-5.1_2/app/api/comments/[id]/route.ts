import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const commentId = Number(id);
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(comment);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const commentId = Number(id);
  const { content } = await req.json();

  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== Number(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const commentId = Number(id);

  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== Number(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return NextResponse.json({ ok: true });
}
