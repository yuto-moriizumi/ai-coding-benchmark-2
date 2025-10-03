import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { redirect, notFound } from "next/navigation";
import EditPostForm from "./EditPostForm";
import Link from "next/link";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = parseInt(id);

  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    notFound();
  }

  if (post.authorId !== session.userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Edit Post</h1>
      <EditPostForm
        postId={postId}
        initialTitle={post.title}
        initialContent={post.content}
      />
      <div className="mt-4">
        <Link
          href={`/posts/${post.id}`}
          className="text-blue-600 hover:underline"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
