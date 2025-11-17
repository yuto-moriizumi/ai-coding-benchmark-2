import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/session';
import Link from 'next/link';
import { DeletePostButton, DeleteCommentButton } from '@/app/lib/DeleteButtons';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!post) {
    notFound();
  }

  async function addComment(formData: FormData) {
    'use server';
    
    const session = await getSession();
    if (!session) {
      return;
    }

    const content = formData.get('content') as string;
    const postId = formData.get('postId') as string;

    await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        authorId: session.id,
      },
    });

    redirect(`/posts/${postId}`);
  }

  async function deletePost(formData: FormData) {
    'use server';
    
    const session = await getSession();
    if (!session) {
      return;
    }

    const postId = formData.get('postId') as string;

    await prisma.post.delete({
      where: { id: parseInt(postId) },
    });

    redirect('/');
  }

  async function deleteComment(formData: FormData) {
    'use server';
    
    const session = await getSession();
    if (!session) {
      return;
    }

    const commentId = formData.get('commentId') as string;
    const postId = formData.get('postId') as string;

    await prisma.comment.delete({
      where: { id: parseInt(commentId) },
    });

    redirect(`/posts/${postId}`);
  }

  const isAuthor = session?.id === post.authorId;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Back to Blog
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white p-6 rounded-lg shadow mb-8">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="text-sm text-gray-500 mb-4">
            By {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
          </div>
          <div className="prose max-w-none mb-6">{post.content}</div>
          
          {isAuthor && (
            <div className="flex gap-4 border-t pt-4">
              <Link
                href={`/posts/${post.id}/edit`}
                data-testid="edit-post-button"
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Edit
              </Link>
              <DeletePostButton deleteAction={deletePost} postId={post.id} />
            </div>
          )}
        </article>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          
          {session ? (
            <form action={addComment} className="mb-6">
              <input type="hidden" name="postId" value={post.id} />
              <div className="mb-4">
                <label htmlFor="comment" className="block mb-2 font-medium">
                  Comment
                </label>
                <textarea
                  id="comment"
                  name="content"
                  rows={3}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </form>
          ) : (
            <p className="mb-6 text-gray-600">Please login to add a comment</p>
          )}

          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="mb-2">{comment.content}</p>
                <div className="text-sm text-gray-500 mb-2">
                  By {comment.author.username} on {new Date(comment.createdAt).toLocaleDateString()}
                </div>
                {session?.id === comment.authorId && (
                  <div className="flex gap-2">
                    <Link
                      href={`/posts/${post.id}/comments/${comment.id}/edit`}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <DeleteCommentButton 
                      deleteAction={deleteComment} 
                      commentId={comment.id}
                      postId={post.id}
                    />
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
