import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    const article = await prisma.article.findUnique({
      where: { id: articleId },
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
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!article) {
      return Response.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return Response.json({ article });
  } catch (error) {
    console.error("Get article error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    const { title, content } = await request.json();

    if (!title || !content) {
      return Response.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        content,
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return Response.json({ article });
  } catch (error) {
    console.error("Update article error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    await prisma.article.delete({
      where: { id: articleId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete article error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
