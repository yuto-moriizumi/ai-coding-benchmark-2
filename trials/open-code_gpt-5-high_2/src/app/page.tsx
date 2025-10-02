import Link from 'next/link';
import { prisma } from '../lib/prisma';

export default async function Home() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {posts.map(p => (
          <li key={p.id}>
            <Link href={`/posts/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
