import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  DeletePostButton,
  DeleteCommentButton,
} from "@/components/DeleteButton";
import { CommentEditForm } from "@/components/CommentEditForm";

export const dynamic = "force-dynamic";

async function addComment(postId: number, formData: FormData) {
  "use server";

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const content = formData.get("content") as string;

  await prisma.comment.create({
    data: {
      content,
      authorId: user.id,
      postId,
    },
  });

  revalidatePath(`/posts/${postId}`);
}

async function deletePost(postId: number) {
  "use server";

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post || post.authorId !== user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  redirect("/");
}

async function updateComment(
  commentId: number,
  postId: number,
  formData: FormData
) {
  "use server";

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const content = formData.get("content") as string;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.authorId !== user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });

  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

async function deleteComment(commentId: number, postId: number) {
  "use server";

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.authorId !== user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath(`/posts/${postId}`);
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ editComment?: string }>;
}) {
  const { id } = await params;
  const { editComment } = await searchParams;
  const postId = parseInt(id);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { id: true, username: true },
      },
      comments: {
        include: {
          author: {
            select: { id: true, username: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const user = await getCurrentUser();
  const isAuthor = user?.id === post.authorId;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          Back to Blog
        </Link>

        <article className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-gray-600 mb-4">By {post.author.username}</p>
          {/* DEBUG INFO */}
          <div className="bg-yellow-100 p-4 mb-4 text-xs">
            <p>
              Post Author ID: {post.authorId}, Username: {post.author.username}
            </p>
            <p>
              Current User ID: {user?.id || "null"}, Username:{" "}
              {user?.username || "null"}
            </p>
            <p>Is Author: {isAuthor ? "Yes" : "No"}</p>
          </div>
          <div className="prose max-w-none">{post.content}</div>
        </article>

        {isAuthor && (
          <div className="mb-8 flex gap-4" data-testid="post-actions">
            <Link
              href={`/posts/${post.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              data-testid="edit-post-button"
            >
              Edit
            </Link>
            <form action={deletePost.bind(null, post.id)}>
              <DeletePostButton />
            </form>
          </div>
        )}

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>

          <div className="space-y-4 mb-8">
            {post.comments.map((comment) => {
              const isCommentAuthor = user?.id === comment.authorId;
              const isEditing = editComment === comment.id.toString();

              return (
                <div key={comment.id} className="border p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold">{comment.author.username}</p>
                    {isCommentAuthor && !isEditing && (
                      <div
                        className="flex gap-2"
                        data-testid={`comment-${comment.id}-actions`}
                      >
                        <Link
                          href={`/posts/${post.id}?editComment=${comment.id}`}
                          className="text-blue-600 hover:underline text-sm"
                          data-testid={`edit-comment-${comment.id}`}
                        >
                          Edit
                        </Link>
                        <form
                          action={deleteComment.bind(null, comment.id, post.id)}
                        >
                          <DeleteCommentButton />
                        </form>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <CommentEditForm
                      commentId={comment.id}
                      postId={post.id}
                      initialContent={comment.content}
                      updateAction={updateComment}
                    />
                  ) : (
                    <p>{comment.content}</p>
                  )}
                </div>
              );
            })}
          </div>

          {user ? (
            <form action={addComment.bind(null, post.id)} className="space-y-4">
              <div>
                <label htmlFor="comment" className="block mb-2">
                  Comment
                </label>
                <textarea
                  id="comment"
                  name="content"
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          ) : (
            <p className="text-gray-600">Please login to add a comment</p>
          )}
        </div>
      </div>
    </div>
  );
}
