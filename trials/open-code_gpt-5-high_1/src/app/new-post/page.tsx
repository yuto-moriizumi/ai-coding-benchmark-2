import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function createAction(formData: FormData) {
  'use server';
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const title = (formData.get('title') as string).trim();
  const content = (formData.get('content') as string).trim();
  const post = await prisma.post.create({ data: { title, content, authorId: user.id } });
  redirect(`/posts/${post.id}`);
}

export default async function NewPostPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return (
    <div>
      <h1>New Post</h1>
      <form action={createAction}>
        <label htmlFor="title">Title</label><br />
        <input id="title" name="title" required /><br />
        <label htmlFor="content">Content</label><br />
        <textarea id="content" name="content" required />
        <br />
        <button type="submit">Publish Post</button>
      </form>
    </div>
  );
}