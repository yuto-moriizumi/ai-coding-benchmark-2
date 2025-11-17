import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type EditCommentParams = Promise<{
  id: string;
}>;

export default async function EditCommentPage({
  params,
}: {
  params: EditCommentParams;
}) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  if (!id) notFound();

  const [comment, user] = await Promise.all([
    prisma.comment.findUnique({ include: { post: true }, where: { id } }),
    getCurrentUser(),
  ]);

  if (!comment) notFound();
  if (!user || user.id !== comment.authorId) {
    redirect("/login");
  }

  async function updateComment(formData: FormData) {
    "use server";
    const current = await getCurrentUser();
    if (!current || current.id !== comment.authorId) {
      redirect("/login");
    }
    const content = String(formData.get("content") || "");
    await prisma.comment.update({
      where: { id: comment.id },
      data: { content },
    });
    redirect(`/posts/${comment.postId}`);
  }

  return (
    <div>
      <h1>Edit Comment</h1>
      <form action={updateComment}>
        <textarea name="content" defaultValue={comment.content} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
