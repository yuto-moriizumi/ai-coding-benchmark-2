import Link from 'next/link';
import { getCurrentUser } from '@/lib/get-user';
import { prisma } from '@/lib/db';

export default async function Home() {
  const user = await getCurrentUser();
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
             <div className="flex items-center space-x-4">
               {user ? (
                 <>
                   <span className="text-gray-700">Hello, {user.username}</span>
                   <form action="/api/logout" method="post" className="inline">
                     <button
                       type="submit"
                       className="text-gray-600 hover:text-gray-900"
                     >
                       Logout
                     </button>
                   </form>
                 </>
               ) : (
                 <>
                   <Link href="/login" className="text-blue-600 hover:text-blue-800">
                     Login
                   </Link>
                   <Link href="/register" className="text-blue-600 hover:text-blue-800">
                     Register
                   </Link>
                 </>
               )}
               <Link
                 href="/new-post"
                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
               >
                 Add new article
               </Link>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {posts.length === 0 ? (
            <p className="text-gray-500">No posts yet.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article key={post.id} className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    <Link href={`/posts/${post.id}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4">
                    By {post.author.username} on {post.createdAt.toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">{post.content.substring(0, 200)}...</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
