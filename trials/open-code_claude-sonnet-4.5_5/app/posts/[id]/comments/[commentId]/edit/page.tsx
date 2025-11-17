import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/session';
import Link from 'next/link';

export default async function EditCommentPage({ 
  params 
}: { 
  params: Promise<{ id: string; commentId: string }> 
}) {
  const { id, commentId } = await params;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) },
  });

  if (!comment) {
    notFound();
  }

  if (comment.authorId !== session.id) {
    redirect(`/posts/${id}`);
  }

  async function updateComment(formData: FormData) {
    'use server';
    
    const session = await getSession();
    if (!session) {
      redirect('/login');
    }

    const commentId = formData.get('commentId') as string;
    const postId = formData.get('postId') as string;
    const content = formData.get('content') as string;

    await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { content },
    });

    redirect(`/posts/${postId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Edit Comment</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form action={updateComment} className="bg-white p-6 rounded-lg shadow">
          <input type="hidden" name="commentId" value={comment.id} />
          <input type="hidden" name="postId" value={id} />
          
          <div className="mb-4">
            <label htmlFor="content" className="block mb-2 font-medium">
              Comment
            </label>
            <textarea
              id="content"
              name="content"
              rows={5}
              defaultValue={comment.content}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update
            </button>
            <Link
              href={`/posts/${id}`}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
