import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/session';
import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';

export default async function NewPostPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  async function createPost(formData: FormData) {
    'use server';
    
    const session = await getSession();
    if (!session) {
      redirect('/login');
    }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: session.id,
      },
    });

    redirect(`/posts/${post.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form action={createPost} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label htmlFor="title" className="block mb-2 font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
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
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Publish Post
            </button>
            <Link
              href="/"
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
