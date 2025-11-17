import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/session';

export default async function Home() {
  const session = await getSession();
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Blog</h1>
          <div className="flex gap-4">
            {session ? (
              <span className="text-gray-700">Welcome, {session.username}</span>
            ) : (
              <>
                <Link href="/login" className="text-blue-500 hover:underline">
                  Login
                </Link>
                <Link href="/register" className="text-blue-500 hover:underline">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/new-post"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add new article
          </Link>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow">
              <Link href={`/posts/${post.id}`}>
                <h2 className="text-xl font-semibold mb-2 hover:text-blue-500">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-600 mb-2">{post.content.substring(0, 200)}...</p>
              <div className="text-sm text-gray-500">
                By {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
