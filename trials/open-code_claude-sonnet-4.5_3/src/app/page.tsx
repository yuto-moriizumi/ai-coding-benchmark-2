import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

async function logout() {
  'use server'
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  cookieStore.delete('userId')
  const { redirect } = await import('next/navigation')
  redirect('/')
}

export default async function Home() {
  const session = await getSession()
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { username: true }
      }
    }
  })

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog</h1>
          <div className="flex gap-4">
            {session ? (
              <>
                <span>Welcome, {session.username}</span>
                <form action={logout}>
                  <button type="submit" className="text-blue-500">Logout</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-blue-500">Login</Link>
                <Link href="/register" className="text-blue-500">Register</Link>
              </>
            )}
          </div>
        </div>

        <div className="mb-8">
          <Link href="/new-post" className="bg-blue-500 text-white px-4 py-2 rounded">
            Add new article
          </Link>
        </div>

        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="border p-4 rounded">
              <Link href={`/posts/${post.id}`}>
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              </Link>
              <p className="text-gray-600 mb-2">{post.content.substring(0, 150)}...</p>
              <p className="text-sm text-gray-500">By {post.author.username}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
