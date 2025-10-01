import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: { username: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '2rem'}}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold'}}>Blog Posts</h1>
        {user ? (
          <Link 
            href="/new-post" 
            className="btn"
          >
            Add new article
          </Link>
        ) : (
          <Link 
            href="/login" 
            className="btn"
          >
            Add new article
          </Link>
        )}
      </div>

      <div className="post-list">
        {posts.length === 0 ? (
          <p style={{color: '#6b7280'}}>No posts yet. Be the first to create one!</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-item">
              <Link href={`/posts/${post.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem'}}>{post.title}</h2>
              </Link>
              <p className="post-meta">By {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

