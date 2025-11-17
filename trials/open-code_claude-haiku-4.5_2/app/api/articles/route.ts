import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const articles = await prisma.article.findMany({
      include: {
        user: {
          select: { id: true, email: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ articles });
  } catch (error) {
    console.error("Get articles error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, userId } = await request.json();

    if (!title || !content || !userId) {
      return Response.json(
        { error: "Title, content, and userId are required" },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        userId,
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return Response.json({ article }, { status: 201 });
  } catch (error) {
    console.error("Create article error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
