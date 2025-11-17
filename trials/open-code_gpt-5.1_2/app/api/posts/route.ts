import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const { title, content } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: Number(userId),
    },
  });

  return NextResponse.json(post);
}
