import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = parseInt(id);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!comment) {
      return Response.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    return Response.json({ comment });
  } catch (error) {
    console.error("Get comment error:", error);
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
    const commentId = parseInt(id);
    const { content } = await request.json();

    if (!content) {
      return Response.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return Response.json({ comment });
  } catch (error) {
    console.error("Update comment error:", error);
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
    const commentId = parseInt(id);

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}