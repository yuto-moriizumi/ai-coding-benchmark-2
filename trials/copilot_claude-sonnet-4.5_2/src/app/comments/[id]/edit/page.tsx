import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { redirect, notFound } from "next/navigation";
import EditCommentForm from "./EditCommentForm";
import Link from "next/link";

export default async function EditCommentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const commentId = parseInt(id);

  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    notFound();
  }

  if (comment.authorId !== session.userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Edit Comment</h1>
      <EditCommentForm commentId={commentId} initialContent={comment.content} />
      <div className="mt-4">
        <Link
          href={`/posts/${comment.postId}`}
          className="text-blue-600 hover:underline"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
