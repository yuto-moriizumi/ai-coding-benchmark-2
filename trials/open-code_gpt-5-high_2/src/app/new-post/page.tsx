import { requireUser } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { redirect } from 'next/navigation';

async function createPost(formData: FormData) {
  'use server';
  const user = await requireUser();
  const title = String(formData.get('title')||'').trim();
  const content = String(formData.get('content')||'').trim();
  if (!title || !content) return { error: 'Title and content required' };
  const post = await prisma.post.create({ data: { title, content, authorId: user.id } });
  redirect(`/posts/${post.id}`);
}

export default async function NewPostPage() {
  await requireUser();
  return (
    <div>
      <h1>New Post</h1>
      <form action={createPost}>
        <label>Title<input id="title" name="title" aria-label="Title" /></label><br />
        <label>Content<textarea id="content" name="content" aria-label="Content" /></label><br />
        <button type="submit">Publish Post</button>
      </form>
    </div>
  );
}
