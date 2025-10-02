import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { getSessionUser } from '../lib/session';

export default async function Home() {
  const posts = await prisma.post.findMany({ orderBy: { id: 'desc' } });
  const user = await getSessionUser();
  return (
    <div>
      {user && <p className="mb-2">Logged in as {user.username}</p>}
      <h1 className="text-2xl mb-4">Blog</h1>
      <ul className="space-y-2 mb-6">
        {posts.map(p => (<li key={p.id}><Link className="underline" href={`/posts/${p.id}`}>{p.title}</Link></li>))}
      </ul>
      {!user && (
        <p className="text-sm text-gray-600">Please register or login to post.</p>
      )}
    </div>
  );
}
