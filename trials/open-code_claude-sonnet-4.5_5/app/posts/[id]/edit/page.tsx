import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/session';
import Link from 'next/link';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
  });

  if (!post) {
    notFound();
  }

  if (post.authorId !== session.id) {
    redirect(`/posts/${id}`);
  }

  async function updatePost(formData: FormData) {
    'use server';
    
    const session = await getSession();
    if (!session) {
      redirect('/login');
    }

    const postId = formData.get('postId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    await prisma.post.update({
      where: { id: parseInt(postId) },
      data: { title, content },
    });

    redirect(`/posts/${postId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Edit Post</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form action={updatePost} className="bg-white p-6 rounded-lg shadow">
          <input type="hidden" name="postId" value={post.id} />
          
          <div className="mb-4">
            <label htmlFor="title" className="block mb-2 font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={post.title}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block mb-2 font-medium">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              defaultValue={post.content}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Post
            </button>
            <Link
              href={`/posts/${post.id}`}
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
