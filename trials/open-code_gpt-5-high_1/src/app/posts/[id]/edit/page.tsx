import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function updateAction(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  const title = (formData.get('title') as string).trim();
  const content = (formData.get('content') as string).trim();
  const user = await getCurrentUser();
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) redirect('/');
  if (!user || user.id !== post.authorId) redirect(`/posts/${id}`);
  await prisma.post.update({ where: { id }, data: { title, content } });
  redirect(`/posts/${id}`);
}

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  const user = await getCurrentUser();
  if (!post) return <div>Not found</div>;
  if (!user) redirect('/login');
  if (user.id !== post.authorId) redirect(`/posts/${id}`);
  return (
    <div>
      <h1>Edit Post</h1>
      <form action={updateAction}>
        <input type="hidden" name="id" value={post.id} />
        <label htmlFor="title">Title</label><br />
        <input id="title" name="title" defaultValue={post.title} required /><br />
        <label htmlFor="content">Content</label><br />
        <textarea id="content" name="content" defaultValue={post.content} required />
        <br />
        <button type="submit">Update Post</button>
      </form>
    </div>
  );
}