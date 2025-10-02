import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DeleteButton, DeleteCommentButton } from "@/components/DeleteButton";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = parseInt(id);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const user = await getSession();
  const isAuthor = user?.id === post.authorId;

  async function addComment(formData: FormData) {
    "use server";

    const user = await getSession();
    if (!user) {
      return;
    }

    const content = formData.get("content") as string;
    const postId = parseInt(formData.get("postId") as string);

    await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: user.id,
      },
    });

    revalidatePath(`/posts/${postId}`);
    redirect(`/posts/${postId}`);
  }

  async function deletePost(formData: FormData) {
    "use server";

    const user = await getSession();
    if (!user) {
      redirect("/login");
    }

    const postId = parseInt(formData.get("postId") as string);
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.authorId !== user.id) {
      return;
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/");
    redirect("/");
  }

  async function deleteComment(formData: FormData) {
    "use server";

    const user = await getSession();
    if (!user) {
      return;
    }

    const commentId = parseInt(formData.get("commentId") as string);
    const postId = parseInt(formData.get("postId") as string);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.authorId !== user.id) {
      return;
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/posts/${postId}`);
    redirect(`/posts/${postId}`);
  }

  return (
    <div className="min-h-screen p-8">
      <Link
        href="/"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        Back to Blog
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-4">By {post.author.username}</p>
        <article className="prose max-w-none">{post.content}</article>

        {isAuthor && (
          <div className="mt-4 flex gap-2">
            <Link
              href={`/posts/${post.id}/edit`}
              data-testid="edit-post-button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit
            </Link>
            <DeleteButton action={deletePost} name="postId" value={post.id} />
          </div>
        )}
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>

        {user ? (
          <form action={addComment} className="mb-8">
            <input type="hidden" name="postId" value={post.id} />
            <div>
              <label htmlFor="comment" className="block mb-2">
                Comment
              </label>
              <textarea
                id="comment"
                name="content"
                required
                rows={4}
                className="w-full border p-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        ) : (
          <p className="mb-8">Please login to add a comment</p>
        )}

        <div className="space-y-4">
          {post.comments.map((comment) => (
            <div key={comment.id} className="border p-4 rounded">
              <p className="mb-2">{comment.content}</p>
              <p className="text-sm text-gray-600">
                By {comment.author.username}
              </p>

              {user?.id === comment.authorId && (
                <div className="mt-2 flex gap-2">
                  <Link
                    href={`/posts/${post.id}/comments/${comment.id}/edit`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </Link>
                  <DeleteCommentButton
                    action={deleteComment}
                    commentId={comment.id}
                    postId={post.id}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
