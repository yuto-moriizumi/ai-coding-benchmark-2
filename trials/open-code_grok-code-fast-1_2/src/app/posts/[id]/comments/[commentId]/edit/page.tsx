import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-user';
import { prisma } from '@/lib/db';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string; commentId: string }>;
}

export default async function EditCommentPage({ params }: PageProps) {
  const { id, commentId } = await params;
  const postId = parseInt(id);
  const commentIdNum = parseInt(commentId);
  if (isNaN(postId) || isNaN(commentIdNum)) {
    notFound();
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentIdNum },
    include: { author: true, post: true },
  });

  if (!comment || comment.postId !== postId) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user || user.id !== comment.authorId) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Comment</h1>
            <Link
              href={`/posts/${postId}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Post
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form action={`/api/comments/${commentIdNum}`} method="post">
            <input type="hidden" name="_method" value="PUT" />
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <textarea
                name="content"
                id="content"
                rows={4}
                required
                defaultValue={comment.content}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="mt-2">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}