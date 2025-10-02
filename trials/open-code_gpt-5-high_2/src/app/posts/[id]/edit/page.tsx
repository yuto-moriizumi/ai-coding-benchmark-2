import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { redirect } from 'next/navigation';

async function updatePost(formData: FormData) {
  'use server';
  const user = await requireUser();
  const id = Number(formData.get('id'));
  const title = String(formData.get('title')||'');
  const content = String(formData.get('content')||'');
  const post = await prisma.post.findUnique({ where: { id } });
  if (post && post.authorId === user.id) {
    await prisma.post.update({ where: { id }, data: { title, content } });
  }
  redirect(`/posts/${id}`);
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id: idParam } = await params;
  const id = Number(idParam);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return <div>Not found</div>;
  if (post.authorId !== user.id) return <div>Forbidden</div>;
  return (
    <div>
      <h1>Edit Post</h1>
      <form action={updatePost}>
        <input type="hidden" name="id" value={post.id} />
        <label>Title<input id="title" name="title" defaultValue={post.title} aria-label="Title" /></label><br />
        <label>Content<textarea id="content" name="content" defaultValue={post.content} aria-label="Content" /></label><br />
        <button type="submit">Update Post</button>
      </form>
    </div>
  );
}
