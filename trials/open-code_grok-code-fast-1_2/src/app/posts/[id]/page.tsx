import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-user';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) {
    notFound();
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const user = await getCurrentUser();
  const isAuthor = user?.id === post.authorId;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Blog
            </Link>
            {isAuthor && (
              <div className="flex space-x-4">
                <Link
                  href={`/posts/${postId}/edit`}
                  data-testid="edit-post-button"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </Link>
                <DeleteButton action={`/api/posts/${postId}?_method=DELETE`}>
                  Delete
                </DeleteButton>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <article className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-gray-600 mb-6">
            By {post.author.username} on {post.createdAt.toLocaleDateString()}
          </p>
          <div className="prose max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments</h2>

          {user ? (
            <form action={`/api/posts/${postId}/comments`} method="post">
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                  Comment
                </label>
                <textarea
                  name="content"
                  id="comment"
                  rows={4}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mt-2">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600 mb-6">Please login to add a comment</p>
          )}

          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="bg-white shadow rounded-lg p-4">
                <p className="text-gray-700 mb-2">{comment.content}</p>
                <p className="text-sm text-gray-500">
                  By {comment.author.username} on {comment.createdAt.toLocaleDateString()}
                </p>
                {user?.id === comment.authorId && (
                  <div className="mt-2">
                     <Link
                       href={`/posts/${postId}/comments/${comment.id}/edit`}
                       data-testid="edit-comment-button"
                       className="text-blue-600 hover:text-blue-800 mr-4"
                     >
                       Edit
                     </Link>
                    <DeleteButton action={`/api/comments/${comment.id}`}>
                      Delete
                    </DeleteButton>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}