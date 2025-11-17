import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export default async function Home() {
  const session = await getSession()
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  })
  
  async function logout() {
    'use server'
    const session = await getSession()
    session.destroy()
    redirect('/')
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog</h1>
        <div className="flex gap-4 items-center">
          {session.isLoggedIn ? (
            <>
              <span>Welcome, {session.username}</span>
              <form action={logout}>
                <button type="submit" className="text-blue-500 hover:underline">
                  Logout
                </button>
              </form>
            </>
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
      </header>
      
      <div className="mb-6">
        <Link 
          href="/new-post" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add new article
        </Link>
      </div>
      
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="border p-4 rounded">
              <Link href={`/posts/${post.id}`}>
                <h2 className="text-xl font-semibold hover:text-blue-500">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-600 text-sm mt-1">
                by {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
