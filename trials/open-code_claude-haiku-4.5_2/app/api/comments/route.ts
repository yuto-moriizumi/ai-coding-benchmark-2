import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { content, userId, articleId } = await request.json();

    if (!content || !userId || !articleId) {
      return Response.json(
        { error: "Content, userId, and articleId are required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        articleId,
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
