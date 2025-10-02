import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export default async function Home() {
  const user = await getCurrentUser()
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: true,
    },
  })

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <h1>Blog</h1>
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          {user ? (
            <>
              <span>Welcome, {user.username}</span>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
          <Link href="/new-post">Add new article</Link>
        </div>
      </header>

      <main>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {posts.map((post) => (
              <div key={post.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h2>
                  <Link href={`/posts/${post.id}`}>{post.title}</Link>
                </h2>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  By {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
