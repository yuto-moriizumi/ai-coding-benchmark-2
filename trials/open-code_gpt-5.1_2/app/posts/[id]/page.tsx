import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { id: true, username: true },
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = Number(id);
  if (Number.isNaN(postId)) redirect("/");

  const [post, sessionUser] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    getSessionUser(),
  ]);

  if (!post) redirect("/");

  const isAuthor = sessionUser && sessionUser.id === post.authorId;

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <article className="prose whitespace-pre-wrap border p-4 rounded">
        {post.content}
      </article>
      <p className="text-sm text-gray-600">
        By {post.author.username}
      </p>

      <div className="flex gap-2 mt-4">
        <Link href="/" className="text-blue-600 underline">
          Back to Blog
        </Link>
        {isAuthor && (
          <Link
            href={`/posts/${post.id}/edit`}
            data-testid="edit-post-button"
            className="ml-auto text-blue-600 underline"
          >
            Edit
          </Link>
        )}
      </div>

      <section className="mt-6 space-y-2">
        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        {sessionUser ? (
          <form
            action={`/posts/${post.id}/comments`}
            method="post"
            className="space-y-2"
          >
            <label htmlFor="comment" className="block">
              Comment
            </label>
            <textarea
              id="comment"
              name="content"
              className="border rounded w-full p-2"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          </form>
        ) : (
          <p>Please login to add a comment</p>
        )}

        <div className="space-y-2 mt-4">
          {post.comments.map((comment) => {
            const canEdit = sessionUser && sessionUser.id === comment.authorId;
            return (
              <div
                key={comment.id}
                className="border rounded p-2 flex items-center justify-between gap-2"
              >
                <span>{comment.content}</span>
                {canEdit && (
                  <div className="flex gap-2 text-sm">
                    <Link
                      href={`/comments/${comment.id}/edit`}
                      className="text-blue-600 underline"
                    >
                      Edit
                    </Link>
                    <form
                      action={`/comments/${comment.id}/delete`}
                      method="post"
                    >
                      <button
                        type="submit"
                        className="text-red-600 underline"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {isAuthor && (
        <form
          action={`/posts/${post.id}/delete`}
          method="post"
          className="mt-4"
        >
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </form>
      )}
    </main>
  );
}
