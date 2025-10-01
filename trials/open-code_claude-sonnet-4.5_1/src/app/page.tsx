import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export default async function Home() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  })
  const user = await getSession()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog</h1>
          <div className="flex gap-4">
            <Link href="/new-post" className="text-blue-500 hover:underline">
              Add new article
            </Link>
            {user ? (
              <span>Welcome, {user.username}</span>
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

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border p-4 rounded">
              <Link href={`/posts/${post.id}`} className="text-xl font-semibold text-blue-500 hover:underline">
                {post.title}
              </Link>
              <p className="text-gray-600 mt-2">{post.content.substring(0, 150)}...</p>
              <p className="text-sm text-gray-500 mt-2">By {post.author.username}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
