import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export default async function Home() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  })

  const session = await getSession()

  return (
    <div className="container">
      <div className="header">
        <h1>Blog</h1>
        <div className="nav">
          {session.isLoggedIn ? (
            <>
              <span>Welcome, {session.username}</span>
              <Link href="/new-post" className="link">
                Add new article
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="link">
                Login
              </Link>
              <Link href="/register" className="link">
                Register
              </Link>
              <Link href="/new-post" className="link">
                Add new article
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="post-list">
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <Link href={`/posts/${post.id}`} className="post-title">
              {post.title}
            </Link>
            <p className="post-meta">
              by {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
