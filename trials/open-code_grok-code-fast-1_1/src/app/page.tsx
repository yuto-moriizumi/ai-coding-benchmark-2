import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: { username: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Latest Posts</h1>
      {posts.length === 0 ? (
        <p className="text-gray-600">No posts yet. Be the first to create one!</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">
                <Link href={`/posts/${post.id}`} className="hover:text-blue-600">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">
                By {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-800">{post.content.substring(0, 200)}...</p>
              <Link href={`/posts/${post.id}`} className="text-blue-600 hover:underline mt-2 inline-block">
                Read more
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
