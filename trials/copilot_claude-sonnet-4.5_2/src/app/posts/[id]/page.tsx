import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import DeletePostButton from "./DeletePostButton";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

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

  const session = await getSession();
  const isAuthor = session.userId === post.authorId;

  return (
    <div className="min-h-screen p-8">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-600 mb-4">
          By {post.author.username} on{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
        <div className="prose max-w-none mb-8 whitespace-pre-wrap">
          {post.content}
        </div>

        {isAuthor && (
          <div className="flex gap-4 mb-8">
            <Link
              href={`/posts/${post.id}/edit`}
              data-testid="edit-post-button"
              className="text-blue-600 hover:underline"
            >
              Edit
            </Link>
            <DeletePostButton postId={post.id} />
          </div>
        )}

        <Link href="/" className="text-blue-600 hover:underline block mb-8">
          Back to Blog
        </Link>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">Comments</h2>

          {session.isLoggedIn ? (
            <CommentForm postId={post.id} />
          ) : (
            <p className="mb-4">Please login to add a comment</p>
          )}

          <CommentList
            comments={post.comments}
            currentUserId={session.userId}
          />
        </div>
      </article>
    </div>
  );
}
