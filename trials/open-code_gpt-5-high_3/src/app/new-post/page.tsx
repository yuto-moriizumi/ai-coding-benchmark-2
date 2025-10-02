import { requireUser } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import { redirect } from 'next/navigation';

async function createPost(formData: FormData){
  'use server';
  const user = await requireUser();
  const title = String(formData.get('title')||'').trim();
  const content = String(formData.get('content')||'').trim();
  if(!title || !content) return { error: 'Missing fields' };
  const post = await prisma.post.create({ data: { title, content, authorId: user.id } });
  redirect(`/posts/${post.id}`);
}

export default async function NewPost(){
  try { await requireUser(); } catch { redirect('/login'); }
  return (
    <div>
      <h1 className="text-xl mb-4">New Post</h1>
      <form action={createPost} className="flex flex-col gap-2">
        <label>Title<input id="title" name="title" className="border p-1" /></label>
        <label>Content<textarea id="content" name="content" className="border p-1" /></label>
        <button type="submit" className="bg-green-600 text-white px-3 py-1">Publish Post</button>
      </form>
    </div>
  );
}
