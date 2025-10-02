import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-user';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function NewPost() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  async function createPost(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id,
      },
    });

    redirect(`/posts/${post.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">New Post</h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form action={createPost} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                name="content"
                id="content"
                rows={10}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Publish Post
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}