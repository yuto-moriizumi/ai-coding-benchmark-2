import { prisma } from '@/lib/prisma';

export default async function Home() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <h1>Blog</h1>
      {posts.length === 0 && <p>No posts yet.</p>}
      <ul>
        {posts.map(p => (
          <li key={p.id}><a href={`/posts/${p.id}`}>{p.title}</a></li>
        ))}
      </ul>
    </div>
  );
}
