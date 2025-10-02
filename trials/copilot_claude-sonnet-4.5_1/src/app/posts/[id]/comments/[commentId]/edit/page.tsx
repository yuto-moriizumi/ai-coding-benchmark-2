import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function EditCommentPage({
  params,
}: {
  params: Promise<{ id: string; commentId: string }>;
}) {
  const { id, commentId } = await params;
  const postId = parseInt(id);
  const commentIdInt = parseInt(commentId);

  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentIdInt },
  });

  if (!comment) {
    notFound();
  }

  if (comment.authorId !== user.id) {
    redirect(`/posts/${postId}`);
  }

  async function updateComment(formData: FormData) {
    "use server";

    const user = await getSession();
    if (!user) {
      redirect("/login");
    }

    const commentId = parseInt(formData.get("commentId") as string);
    const postId = parseInt(formData.get("postId") as string);
    const content = formData.get("content") as string;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.authorId !== user.id) {
      redirect(`/posts/${postId}`);
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
      },
    });

    revalidatePath(`/posts/${postId}`);
    redirect(`/posts/${postId}`);
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Edit Comment</h1>
      <form action={updateComment} className="max-w-2xl space-y-4">
        <input type="hidden" name="commentId" value={comment.id} />
        <input type="hidden" name="postId" value={postId} />
        <div>
          <label htmlFor="content" className="block mb-2">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            defaultValue={comment.content}
            required
            rows={6}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update
        </button>
      </form>
    </div>
  );
}
